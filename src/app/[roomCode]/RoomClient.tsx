'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Room, RoomEvent, Track, ConnectionQuality, Participant } from 'livekit-client';
import {
  DateRoom,
  RoomMessage,
  ThemeType,
  ActiveReaction,
  ReactionPayload,
  LiveKitTokenResponse,
} from '@/lib/types';
import { THEMES, normalizeTheme } from '@/lib/themes';
import { ambienceManager } from '@/lib/ambience';

import Starfield from '@/components/Starfield';
import DynamicIsland from '@/components/island/DynamicIsland';
import ScreenStage from '@/components/room/ScreenStage';
import ParticipantPanel, { ParticipantState } from '@/components/room/ParticipantPanel';
import ChatPanel from '@/components/room/ChatPanel';
import ControlDock from '@/components/room/ControlDock';
import FloatingReactionsOverlay from '@/components/room/FloatingReactionsOverlay';
import AudioInfoModal from '@/components/room/AudioInfoModal';
import LeaveSummaryModal from '@/components/room/LeaveSummaryModal';
import LeaveConfirmModal from '@/components/room/LeaveConfirmModal';
import DeleteConfirmModal from '@/components/room/DeleteConfirmModal';
import RoomDeletedNoticeModal from '@/components/room/RoomDeletedNoticeModal';
import InvitePartnerModal from '@/components/modals/InvitePartnerModal';
import { useRouter } from 'next/navigation';
import { Heart, Loader2, Sparkles } from 'lucide-react';

interface RoomClientProps {
  initialRoom: DateRoom;
}

export default function RoomClient({ initialRoom }: RoomClientProps) {
  const router = useRouter();
  const [room, setThemeRoom] = useState<DateRoom>(initialRoom);
  const [theme, setTheme] = useState<ThemeType>(() => normalizeTheme(initialRoom.theme));
  const [currentUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let savedUserId = localStorage.getItem('moonlit_user_id');
      if (!savedUserId) {
        savedUserId = `usr_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('moonlit_user_id', savedUserId);
      }
      return savedUserId;
    }
    return '';
  });
  const [displayName, setDisplayName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('moonlit_name') || '';
    }
    return '';
  });
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinNameInput, setJoinNameInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('moonlit_name') || '';
    }
    return '';
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time Media States
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenAudioStream, setScreenAudioStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLocalSharing, setIsLocalSharing] = useState(false);
  const [sharerName, setSharerName] = useState<string>('');
  const [hasTabAudio, setHasTabAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // LiveKit Instance Ref
  const lkRoomRef = useRef<Room | null>(null);
  const localScreenTrackRef = useRef<MediaStreamTrack | null>(null);
  const localScreenAudioTrackRef = useRef<MediaStreamTrack | null>(null);
  const localMicTrackRef = useRef<MediaStreamTrack | null>(null);

  // Participants
  const [participants, setParticipants] = useState<ParticipantState[]>([]);

  // Chat - Local-only, sender-only messages (isolated by roomCode and currentUserId)
  const [messages, setMessages] = useState<RoomMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const uid = localStorage.getItem('moonlit_user_id') || '';
        const code = initialRoom.room_code;
        if (uid && code) {
          const storageKey = `moonlit_local_msgs_${code}_${uid}`;
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      } catch {
        // safe fallback
      }
    }
    return [];
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Floating Reactions
  const [reactions, setReactions] = useState<ActiveReaction[]>([]);
  const lastReactionTimeRef = useRef<number>(0);

  // Modals & Panels
  const [isAudioHelpOpen, setIsAudioHelpOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isAmbienceActive, setIsAmbienceActive] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const [isRoomDeletedNoticeOpen, setIsRoomDeletedNoticeOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [elapsedFormatted, setElapsedFormatted] = useState('00:00');
  const autoJoinedRef = useRef(false);

  // Romantic Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // BroadcastChannel for cross-tab sync in local development
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Real-time Reaction Dispatcher
  const triggerReactionAnimation = useCallback((payload: ReactionPayload, isSender: boolean) => {
    const activeReaction: ActiveReaction = {
      ...payload,
      leftPercent: 20 + Math.random() * 60,
      driftDirection: (Math.random() - 0.5) * 2,
    };

    setReactions((prev) => [...prev, activeReaction]);

    if (isSender) {
      if (lkRoomRef.current) {
        const payloadBytes = new TextEncoder().encode(
          JSON.stringify({ type: 'REACTION', payload })
        );
        lkRoomRef.current.localParticipant.publishData(payloadBytes, { reliable: true });
      }
      broadcastChannelRef.current?.postMessage({
        type: 'REACTION',
        payload,
      });
    }
  }, []);

  // Session timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartTime) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsedFormatted(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // Setup Broadcast Channel for local cross-tab communication
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const channelName = `moonlit_room_${room.room_code}`;
    const bc = new BroadcastChannel(channelName);
    broadcastChannelRef.current = bc;

    bc.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'REACTION') {
        triggerReactionAnimation(payload, false);
      } else if (type === 'PARTICIPANT_JOINED') {
        if (payload.userId !== currentUserId) {
          showToast(`${payload.displayName} is here ❤️`);
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#fb7185', '#c084fc', '#fde68a'],
            });
          } catch {
            // safe
          }
          setParticipants((prev) => {
            const existing = prev.find((p) => p.userId === payload.userId);
            if (existing) {
              return prev.map((p) =>
                p.userId === payload.userId
                  ? {
                      ...p,
                      displayName: payload.displayName,
                      isHost: payload.role === 'host',
                      status: 'live' as const,
                    }
                  : p
              );
            }
            return [
              ...prev,
              {
                userId: payload.userId,
                displayName: payload.displayName,
                isHost: payload.role === 'host',
                isMuted: false,
                isSpeaking: false,
                isSharingScreen: false,
                isCameraOn: false,
                status: 'live' as const,
              },
            ];
          });
        }
      } else if (type === 'PARTICIPANT_LEFT') {
        if (payload.userId !== currentUserId) {
          showToast(`${payload.displayName || 'Partner'} left the room`);
          setParticipants((prev) =>
            prev.map((item) =>
              item.userId === payload.userId
                ? {
                    ...item,
                    status: 'offline' as const,
                    isSpeaking: false,
                    isSharingScreen: false,
                    isMuted: true,
                  }
                : item
            )
          );
          if (!isLocalSharing) {
            setScreenStream(null);
            setScreenAudioStream(null);
            setIsScreenSharing(false);
            setSharerName('');
            setHasTabAudio(false);
          }
        }
      } else if (type === 'THEME_CHANGED') {
        const incomingTheme = normalizeTheme(payload?.theme);
        setTheme(incomingTheme);
        setThemeRoom((prev) => ({ ...prev, theme: incomingTheme }));
        showToast(`${THEMES[incomingTheme].name} mood activated ✨`);
      } else if (type === 'ROOM_DELETED') {
        if (lkRoomRef.current) {
          lkRoomRef.current.disconnect();
          lkRoomRef.current = null;
        }
        if (localScreenTrackRef.current) {
          localScreenTrackRef.current.stop();
          localScreenTrackRef.current = null;
        }
        if (localScreenAudioTrackRef.current) {
          localScreenAudioTrackRef.current.stop();
          localScreenAudioTrackRef.current = null;
        }
        if (localMicTrackRef.current) {
          localMicTrackRef.current.stop();
          localMicTrackRef.current = null;
        }
        ambienceManager.stop();
        try {
          const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
          localStorage.removeItem(storageKey);
        } catch {
          // safe
        }
        setIsRoomDeletedNoticeOpen(true);
      } else if (type === 'SCREEN_SHARE_STOPPED') {
        if (!isLocalSharing) {
          setScreenStream(null);
          setScreenAudioStream(null);
          setIsScreenSharing(false);
          setSharerName('');
          setHasTabAudio(false);
        }
      }
    };

    return () => {
      bc.close();
    };
  }, [room.room_code, currentUserId, isLocalSharing, showToast, triggerReactionAnimation]);

  // Connect to LiveKit Room
  const initializeLiveKit = useCallback(async (userName: string) => {
    try {
      const tokenRes = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: room.room_code,
          participantIdentity: currentUserId,
          participantName: userName,
        }),
      });

      const tokenData: LiveKitTokenResponse = await tokenRes.json();
      if (tokenData.token && !tokenData.isMock) {
        if (lkRoomRef.current) {
          lkRoomRef.current.disconnect();
        }

        const lkRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });
        lkRoomRef.current = lkRoom;

        lkRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Video && publication.source === Track.Source.ScreenShare) {
            const stream = new MediaStream([track.mediaStreamTrack]);
            setScreenStream(stream);
            setIsScreenSharing(true);
            setIsLocalSharing(false);
            setSharerName(participant.name || 'Partner');
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === participant.identity ? { ...p, isSharingScreen: true } : p
              )
            );
          } else if (track.kind === Track.Kind.Audio && publication.source === Track.Source.ScreenShareAudio) {
            const audioStream = new MediaStream([track.mediaStreamTrack]);
            setScreenAudioStream(audioStream);
            setHasTabAudio(true);
          }
        });

        lkRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          if (publication.source === Track.Source.ScreenShare) {
            setScreenStream(null);
            setIsScreenSharing(false);
            setSharerName('');
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === participant.identity ? { ...p, isSharingScreen: false } : p
              )
            );
          }
        });

        lkRoom.on(RoomEvent.TrackMuted, (publication, participant) => {
          if (publication.kind === Track.Kind.Audio) {
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === participant.identity ? { ...p, isMuted: true } : p
              )
            );
          }
        });

        lkRoom.on(RoomEvent.TrackUnmuted, (publication, participant) => {
          if (publication.kind === Track.Kind.Audio) {
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === participant.identity ? { ...p, isMuted: false } : p
              )
            );
          }
        });

        lkRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          const speakerIds = new Set(speakers.map((s) => s.identity));
          setParticipants((prev) =>
            prev.map((p) => ({
              ...p,
              isSpeaking: speakerIds.has(p.userId),
            }))
          );
        });

        lkRoom.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
          try {
            const decoded = new TextDecoder().decode(payload);
            const data = JSON.parse(decoded);
            if (data.type === 'REACTION') {
              triggerReactionAnimation(data.payload, false);
            } else if (data.type === 'THEME_CHANGED') {
              const incomingTheme = normalizeTheme(data.payload?.theme);
              setTheme(incomingTheme);
              setThemeRoom((prev) => ({ ...prev, theme: incomingTheme }));
              showToast(`${THEMES[incomingTheme].name} mood activated ✨`);
            } else if (data.type === 'ROOM_DELETED') {
              if (lkRoomRef.current) {
                lkRoomRef.current.disconnect();
                lkRoomRef.current = null;
              }
              if (localScreenTrackRef.current) {
                localScreenTrackRef.current.stop();
                localScreenTrackRef.current = null;
              }
              if (localScreenAudioTrackRef.current) {
                localScreenAudioTrackRef.current.stop();
                localScreenAudioTrackRef.current = null;
              }
              if (localMicTrackRef.current) {
                localMicTrackRef.current.stop();
                localMicTrackRef.current = null;
              }
              ambienceManager.stop();
              try {
                const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
                localStorage.removeItem(storageKey);
              } catch {
                // safe
              }
              setIsRoomDeletedNoticeOpen(true);
            } else if (data.type === 'PARTICIPANT_LEFT') {
              const { userId, displayName: leftName } = data.payload || {};
              if (userId && userId !== currentUserId) {
                showToast(`${leftName || 'Partner'} left the room`);
                setParticipants((prev) =>
                  prev.map((item) =>
                    item.userId === userId
                      ? {
                          ...item,
                          status: 'offline' as const,
                          isSpeaking: false,
                          isSharingScreen: false,
                          isMuted: true,
                        }
                      : item
                  )
                );
                setSharerName((currSharer) => {
                  if (currSharer === leftName || currSharer === 'Partner') {
                    setScreenStream(null);
                    setScreenAudioStream(null);
                    setIsScreenSharing(false);
                    setHasTabAudio(false);
                    return '';
                  }
                  return currSharer;
                });
              }
            }
          } catch (e) {
            console.error('DataReceived decode error:', e);
          }
        });

        // Remote participant connected / rejoined
        lkRoom.on(RoomEvent.ParticipantConnected, (p) => {
          showToast(`${p.name || 'Your person'} is here ❤️`);
          setParticipants((prev) => {
            const existing = prev.find((item) => item.userId === p.identity);
            if (existing) {
              return prev.map((item) =>
                item.userId === p.identity
                  ? {
                      ...item,
                      displayName: p.name || item.displayName,
                      status: 'live' as const,
                      isMuted: !p.isMicrophoneEnabled,
                      isSpeaking: p.isSpeaking,
                      isSharingScreen: p.isScreenShareEnabled,
                    }
                  : item
              );
            }
            return [
              ...prev,
              {
                userId: p.identity,
                displayName: p.name || 'Partner',
                isHost: p.identity === room.host_user_id,
                isMuted: !p.isMicrophoneEnabled,
                isSpeaking: p.isSpeaking,
                isSharingScreen: p.isScreenShareEnabled,
                isCameraOn: false,
                status: 'live' as const,
              },
            ];
          });
        });

        // Remote participant left or disconnected
        lkRoom.on(RoomEvent.ParticipantDisconnected, (p) => {
          showToast(`${p.name || 'Partner'} left the room`);
          setParticipants((prev) =>
            prev.map((item) =>
              item.userId === p.identity
                ? {
                    ...item,
                    status: 'offline' as const,
                    isSpeaking: false,
                    isSharingScreen: false,
                    isMuted: true,
                  }
                : item
            )
          );
          setSharerName((currSharer) => {
            if (currSharer === p.name || currSharer === 'Partner') {
              setScreenStream(null);
              setScreenAudioStream(null);
              setIsScreenSharing(false);
              setHasTabAudio(false);
              return '';
            }
            return currSharer;
          });
        });

        // Connection quality monitoring: show Reconnecting... during temporary recovery
        lkRoom.on(RoomEvent.ConnectionQualityChanged, (quality: ConnectionQuality, p: Participant) => {
          if (p.identity === currentUserId) {
            if (quality === ConnectionQuality.Lost) {
              setParticipants((prev) =>
                prev.map((item) =>
                  item.userId === currentUserId ? { ...item, status: 'reconnecting' as const } : item
                )
              );
            } else if (quality === ConnectionQuality.Good || quality === ConnectionQuality.Excellent) {
              setParticipants((prev) =>
                prev.map((item) =>
                  item.userId === currentUserId && item.status === 'reconnecting'
                    ? { ...item, status: 'live' as const }
                    : item
                )
              );
            }
          } else {
            if (quality === ConnectionQuality.Lost) {
              setParticipants((prev) =>
                prev.map((item) =>
                  item.userId === p.identity ? { ...item, status: 'reconnecting' as const } : item
                )
              );
            } else if (quality === ConnectionQuality.Good || quality === ConnectionQuality.Excellent || quality === ConnectionQuality.Poor) {
              setParticipants((prev) =>
                prev.map((item) =>
                  item.userId === p.identity && item.status === 'reconnecting'
                    ? { ...item, status: 'live' as const }
                    : item
                )
              );
            }
          }
        });

        // Local connection interrupted
        lkRoom.on(RoomEvent.Reconnecting, () => {
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === currentUserId ? { ...p, status: 'reconnecting' as const } : p
            )
          );
        });

        // Local connection re-established
        lkRoom.on(RoomEvent.Reconnected, () => {
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === currentUserId ? { ...p, status: 'live' as const } : p
            )
          );
        });

        // Local disconnected
        lkRoom.on(RoomEvent.Disconnected, () => {
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === currentUserId ? { ...p, status: 'offline' as const } : p
            )
          );
        });

        await lkRoom.connect(tokenData.serverUrl, tokenData.token);

        // Populate participants already connected in the room
        lkRoom.remoteParticipants.forEach((p) => {
          setParticipants((prev) => {
            const existing = prev.find((item) => item.userId === p.identity);
            if (existing) {
              return prev.map((item) =>
                item.userId === p.identity
                  ? {
                      ...item,
                      displayName: p.name || item.displayName,
                      status: 'live' as const,
                      isMuted: !p.isMicrophoneEnabled,
                      isSpeaking: p.isSpeaking,
                      isSharingScreen: p.isScreenShareEnabled,
                    }
                  : item
              );
            }
            return [
              ...prev,
              {
                userId: p.identity,
                displayName: p.name || 'Partner',
                isHost: p.identity === room.host_user_id,
                isMuted: !p.isMicrophoneEnabled,
                isSpeaking: p.isSpeaking,
                isSharingScreen: p.isScreenShareEnabled,
                isCameraOn: false,
                status: 'live' as const,
              },
            ];
          });
        });
      }
    } catch (e) {
      console.warn('LiveKit cloud connection skipped, using local browser WebRTC transport:', e);
    }
  }, [room.room_code, room.host_user_id, currentUserId, triggerReactionAnimation, showToast]);

  // Handle joining room
  const handleJoinRoom = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setIsJoining(true);
    setErrorMessage(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('moonlit_name', name.trim());
      }
      setDisplayName(name.trim());

      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: room.room_code,
          displayName: name.trim(),
          userId: currentUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to join room');
      }

      setIsJoined(true);

      // Add self to participants list
      const selfParticipant: ParticipantState = {
        userId: currentUserId,
        displayName: name.trim(),
        isHost: currentUserId === room.host_user_id || data.member?.role === 'host',
        isMuted: false,
        isSpeaking: false,
        isSharingScreen: false,
        isCameraOn: false,
        status: 'live',
      };

      setParticipants((prev) => {
        const others = prev.filter((p) => p.userId !== currentUserId);
        return [selfParticipant, ...others];
      });

      // Broadcast presence to partner
      broadcastChannelRef.current?.postMessage({
        type: 'PARTICIPANT_JOINED',
        payload: {
          userId: currentUserId,
          displayName: name.trim(),
          role: selfParticipant.isHost ? 'host' : 'guest',
        },
      });

      // Connect to LiveKit
      await initializeLiveKit(name.trim());
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Join error');
    } finally {
      setIsJoining(false);
    }
  }, [room.room_code, room.host_user_id, currentUserId, initializeLiveKit]);

  // Auto-join for the host who created the room
  useEffect(() => {
    if (autoJoinedRef.current) return;
    if (
      !isJoined &&
      currentUserId &&
      (currentUserId === room.host_user_id || (displayName && displayName === room.host_name))
    ) {
      autoJoinedRef.current = true;
      const targetName = displayName || room.host_name;
      const timer = setTimeout(() => {
        void handleJoinRoom(targetName);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentUserId, room.host_user_id, room.host_name, displayName, isJoined, handleJoinRoom]);


  // Screen Sharing Trigger (Browser Native Media with tab audio)
  const handleToggleScreenShare = async () => {
    if (isScreenSharing && isLocalSharing) {
      // Stop sharing
      if (localScreenTrackRef.current) {
        localScreenTrackRef.current.stop();
        localScreenTrackRef.current = null;
      }
      if (localScreenAudioTrackRef.current) {
        localScreenAudioTrackRef.current.stop();
        localScreenAudioTrackRef.current = null;
      }
      if (lkRoomRef.current) {
        lkRoomRef.current.localParticipant.setScreenShareEnabled(false);
      }
      setScreenStream(null);
      setScreenAudioStream(null);
      setIsScreenSharing(false);
      setIsLocalSharing(false);
      setHasTabAudio(false);

      broadcastChannelRef.current?.postMessage({ type: 'SCREEN_SHARE_STOPPED' });
      return;
    }

    try {
      // Request display media with system / tab audio
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 30, max: 60 },
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const videoTrack = captureStream.getVideoTracks()[0];
      const audioTracks = captureStream.getAudioTracks();

      if (!videoTrack) return;

      localScreenTrackRef.current = videoTrack;
      setScreenStream(captureStream);
      setIsScreenSharing(true);
      setIsLocalSharing(true);
      setSharerName(displayName || 'You');

      if (audioTracks.length > 0) {
        localScreenAudioTrackRef.current = audioTracks[0];
        setScreenAudioStream(new MediaStream([audioTracks[0]]));
        setHasTabAudio(true);
      } else {
        setHasTabAudio(false);
      }

      // Publish to LiveKit if connected
      if (lkRoomRef.current) {
        await lkRoomRef.current.localParticipant.setScreenShareEnabled(true, {
          audio: true,
          selfBrowserSurface: 'include',
          surfaceSwitching: 'include',
          systemAudio: 'include',
        });
      }

      // Listen for browser native "Stop sharing" chrome banner
      videoTrack.onended = () => {
        handleToggleScreenShare();
      };
    } catch (err: unknown) {
      console.warn('Screen share canceled or failed:', err);
    }
  };

  // Microphone toggle
  const handleToggleMic = async () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (lkRoomRef.current) {
      await lkRoomRef.current.localParticipant.setMicrophoneEnabled(!nextMuted);
    } else {
      // Native mic track
      if (!nextMuted) {
        try {
          if (!localMicTrackRef.current) {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localMicTrackRef.current = micStream.getAudioTracks()[0];
          } else {
            localMicTrackRef.current.enabled = true;
          }
        } catch (e) {
          console.warn('Microphone permission denied:', e);
          setIsMuted(true);
        }
      } else {
        if (localMicTrackRef.current) {
          localMicTrackRef.current.enabled = false;
        }
      }
    }

    // Update self in participants
    setParticipants((prev) =>
      prev.map((p) => (p.userId === currentUserId ? { ...p, isMuted: nextMuted } : p))
    );
  };


  const handleSelectReaction = (emoji: string) => {
    const now = Date.now();
    // Rate limit reactions to max 5 per second
    if (now - lastReactionTimeRef.current < 200) return;
    lastReactionTimeRef.current = now;

    const payload: ReactionPayload = {
      id: `rx_${Math.random().toString(36).substring(2, 9)}_${now}`,
      emoji,
      senderName: displayName,
      senderId: currentUserId,
      timestamp: now,
    };

    triggerReactionAnimation(payload, true);
  };

  const handleCompleteReaction = (id: string) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  };

  // Chat message sending - Local-only, Sender-only
  const handleSendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const localMessage: RoomMessage = {
      id: `local_msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      room_id: room.id,
      sender_id: currentUserId,
      sender_name: displayName || 'You',
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, localMessage];
      if (typeof window !== 'undefined' && currentUserId && room.room_code) {
        try {
          const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // safe fallback
        }
      }
      return updated;
    });
  };


  // Ambience audio toggle
  const handleToggleAmbience = () => {
    if (isAmbienceActive) {
      ambienceManager.stop();
      setIsAmbienceActive(false);
    } else {
      ambienceManager.start('rain');
      setIsAmbienceActive(true);
    }
  };

  // Theme change with live synchronization and persistence
  const handleThemeChange = (newTheme: ThemeType) => {
    const normalized = normalizeTheme(newTheme);
    setTheme(normalized);
    setThemeRoom((prev) => ({ ...prev, theme: normalized }));

    // 1. Broadcast over LiveKit Data Channel to remote partner
    if (lkRoomRef.current) {
      try {
        const payloadBytes = new TextEncoder().encode(
          JSON.stringify({
            type: 'THEME_CHANGED',
            payload: { theme: normalized, userId: currentUserId, displayName },
          })
        );
        void lkRoomRef.current.localParticipant.publishData(payloadBytes, { reliable: true });
      } catch (err) {
        console.warn('Could not broadcast theme change over LiveKit:', err);
      }
    }

    // 2. Broadcast across local browser tabs
    broadcastChannelRef.current?.postMessage({
      type: 'THEME_CHANGED',
      payload: { theme: normalized, userId: currentUserId, displayName },
    });

    // 3. Persist to Supabase / server room store
    try {
      void fetch('/api/room/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, roomCode: room.room_code, theme: normalized }),
      });
    } catch (err) {
      console.warn('Failed to persist theme:', err);
    }
  };

  // Leave room execution (after confirmation dialog)
  const handleExecuteLeave = useCallback(() => {
    setIsLeaveConfirmOpen(false);

    // 1. Notify partner over LiveKit Data Channel
    if (lkRoomRef.current) {
      try {
        const payloadBytes = new TextEncoder().encode(
          JSON.stringify({
            type: 'PARTICIPANT_LEFT',
            payload: { userId: currentUserId, displayName },
          })
        );
        void lkRoomRef.current.localParticipant.publishData(payloadBytes, { reliable: true });
      } catch (err) {
        console.warn('Could not broadcast leave message over LiveKit:', err);
      }
    }

    // 2. Broadcast across local browser tabs
    broadcastChannelRef.current?.postMessage({
      type: 'PARTICIPANT_LEFT',
      payload: { userId: currentUserId, displayName },
    });

    // 3. Notify backend / Supabase
    try {
      void fetch('/api/room/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: room.room_code, userId: currentUserId }),
      });
    } catch {
      // ignore
    }

    // 4. Update self status to offline
    setParticipants((prev) =>
      prev.map((p) => (p.userId === currentUserId ? { ...p, status: 'offline' as const } : p))
    );

    // 5. Stop all media tracks and disconnect LiveKit
    if (localScreenTrackRef.current) {
      localScreenTrackRef.current.stop();
      localScreenTrackRef.current = null;
    }
    if (localScreenAudioTrackRef.current) {
      localScreenAudioTrackRef.current.stop();
      localScreenAudioTrackRef.current = null;
    }
    if (localMicTrackRef.current) {
      localMicTrackRef.current.stop();
      localMicTrackRef.current = null;
    }
    if (lkRoomRef.current) {
      lkRoomRef.current.disconnect();
      lkRoomRef.current = null;
    }
    ambienceManager.stop();

    // 6. Clear room-specific temporary cached data
    try {
      const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
      localStorage.removeItem(storageKey);
    } catch {
      // safe
    }

    // 7. Redirect to home page
    router.push('/');
  }, [currentUserId, displayName, room.room_code, router]);

  // Delete room execution (Host only, after prominent destructive confirmation dialog)
  const handleExecuteDelete = useCallback(async () => {
    if (currentUserId !== room.host_user_id) {
      showToast('Only the authorized room creator can delete this room');
      return;
    }

    setIsDeletingRoom(true);

    // 1. Broadcast ROOM_DELETED over LiveKit Data Channel to partner
    if (lkRoomRef.current) {
      try {
        const payloadBytes = new TextEncoder().encode(
          JSON.stringify({
            type: 'ROOM_DELETED',
            payload: { roomCode: room.room_code, hostUserId: currentUserId },
          })
        );
        void lkRoomRef.current.localParticipant.publishData(payloadBytes, { reliable: true });
      } catch (err) {
        console.warn('Could not broadcast room delete over LiveKit:', err);
      }
    }

    // 2. Broadcast across local browser tabs
    broadcastChannelRef.current?.postMessage({
      type: 'ROOM_DELETED',
      payload: { roomCode: room.room_code, hostUserId: currentUserId },
    });

    // 3. Call server deletion API
    try {
      const res = await fetch('/api/room/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: room.room_code, userId: currentUserId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to delete room');
      }
    } catch (err: unknown) {
      console.warn('Error deleting room:', err);
      showToast(err instanceof Error ? err.message : 'Error deleting room');
      setIsDeletingRoom(false);
      return;
    }

    // 4. Stop all media tracks and disconnect LiveKit
    if (localScreenTrackRef.current) {
      localScreenTrackRef.current.stop();
      localScreenTrackRef.current = null;
    }
    if (localScreenAudioTrackRef.current) {
      localScreenAudioTrackRef.current.stop();
      localScreenAudioTrackRef.current = null;
    }
    if (localMicTrackRef.current) {
      localMicTrackRef.current.stop();
      localMicTrackRef.current = null;
    }
    if (lkRoomRef.current) {
      lkRoomRef.current.disconnect();
      lkRoomRef.current = null;
    }
    ambienceManager.stop();

    // 5. Clear room-specific local data
    try {
      const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
      localStorage.removeItem(storageKey);
    } catch {
      // safe
    }

    setIsDeleteConfirmOpen(false);
    setIsDeletingRoom(false);

    // 6. Redirect to home page
    router.push('/');
  }, [currentUserId, room.host_user_id, room.room_code, router, showToast]);

  // Handle tab close / unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      broadcastChannelRef.current?.postMessage({
        type: 'PARTICIPANT_LEFT',
        payload: { userId: currentUserId, displayName },
      });

      if (navigator.sendBeacon) {
        const data = JSON.stringify({ roomCode: room.room_code, userId: currentUserId });
        navigator.sendBeacon('/api/room/leave', data);
      }

      if (lkRoomRef.current) {
        lkRoomRef.current.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [currentUserId, displayName, room.room_code]);

  // Clean up LiveKit room and broadcast channel on unmount
  useEffect(() => {
    return () => {
      if (lkRoomRef.current) {
        lkRoomRef.current.disconnect();
        lkRoomRef.current = null;
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
    };
  }, []);

  const isHost = currentUserId === room.host_user_id;
  const currentTheme = THEMES[normalizeTheme(theme)] || THEMES.midnight;
  const activeParticipants = participants.filter((p) => p.status === 'live');
  const partnerNames = activeParticipants.map((p) => p.displayName).join(' & ');
  const onlineCount = activeParticipants.length;

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden text-white selection:bg-rose-500 selection:text-white"
      style={{
        background: currentTheme.bgStyle,
        transition: 'background 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        ['--mood-glow-1' as string]: currentTheme.aura1,
        ['--mood-glow-2' as string]: currentTheme.aura2,
        ['--mood-glow-3' as string]: currentTheme.aura3,
        ['--mood-card-bg' as string]: currentTheme.cardBg,
        ['--mood-card-border' as string]: currentTheme.cardBorder,
        ['--mood-accent' as string]: currentTheme.accentFrom,
        ['--mood-accent-text' as string]: currentTheme.accentTextColor,
      }}
    >
      {/* Ambient Mood Aura layers */}
      <div
        className="pointer-events-none fixed -top-40 left-1/4 h-[550px] w-[550px] rounded-full blur-[140px] opacity-70 transition-all duration-700 z-0"
        style={{ backgroundColor: currentTheme.aura1 }}
      />
      <div
        className="pointer-events-none fixed top-1/3 -right-20 h-[500px] w-[500px] rounded-full blur-[140px] opacity-60 transition-all duration-700 z-0"
        style={{ backgroundColor: currentTheme.aura2 }}
      />
      <div
        className="pointer-events-none fixed -bottom-20 left-1/3 h-[520px] w-[520px] rounded-full blur-[150px] opacity-65 transition-all duration-700 z-0"
        style={{ backgroundColor: currentTheme.aura3 }}
      />

      <Starfield density={70} particleColor={currentTheme.particleColor} />

      {/* Floating Animated Reactions Canvas */}
      <FloatingReactionsOverlay
        reactions={reactions}
        onCompleteReaction={handleCompleteReaction}
      />

      {/* Dynamic Island Capsule Navigation */}
      <DynamicIsland
        mode="room"
        roomCode={room.room_code}
        roomTitle={room.title}
        theme={theme}
        onThemeChange={handleThemeChange}
        participantCount={onlineCount}
        partnerNames={partnerNames}
        isConnected={isJoined}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onLeaveRoom={() => setIsLeaveConfirmOpen(true)}
        onDeleteRoom={() => setIsDeleteConfirmOpen(true)}
        isHost={isHost}
        onToggleAmbience={handleToggleAmbience}
        isAmbienceActive={isAmbienceActive}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full border border-rose-500/30 bg-black/85 px-4 py-2 text-xs font-semibold text-rose-200 shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-rose-400 fill-current animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MAIN THEATER CONTAINER */}
      <main className="relative flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 pt-20 sm:pt-22 pb-24 max-w-7xl mx-auto w-full z-10">
        {/* Left / Top Screen Stage */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScreenStage
            stream={screenStream}
            audioStream={screenAudioStream}
            isSharing={isScreenSharing}
            sharerName={sharerName}
            isLocalSharing={isLocalSharing}
            hasTabAudio={hasTabAudio}
            theme={theme}
            isTheaterMode={isTheaterMode}
            participantCount={onlineCount}
            onOpenInvite={() => setIsInviteModalOpen(true)}
            onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
            onOpenAudioHelp={() => setIsAudioHelpOpen(true)}
            onStartScreenShare={handleToggleScreenShare}
          />

          {/* Participant avatars bar beneath screen in normal mode */}
          {!isTheaterMode && (
            <div className="mt-4">
              <ParticipantPanel
                participants={participants}
                currentUserId={currentUserId}
                theme={theme}
              />
            </div>
          )}
        </div>

        {/* Collapsible Chat Panel on the side */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserId={currentUserId}
          theme={theme}
        />
      </main>

      {/* Control Dock */}
      <ControlDock
        isMuted={isMuted}
        onToggleMic={handleToggleMic}
        isSharing={isScreenSharing && isLocalSharing}
        onToggleScreenShare={handleToggleScreenShare}
        onSelectReaction={handleSelectReaction}
        isChatOpen={isChatOpen}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) setUnreadCount(0);
        }}
        unreadCount={unreadCount}
        isAmbienceActive={isAmbienceActive}
        onToggleAmbience={handleToggleAmbience}
        isTheaterMode={isTheaterMode}
        onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
        onLeaveRoom={() => setIsLeaveConfirmOpen(true)}
        theme={theme}
      />

      {/* Modal: Guest Display Name Prompt on direct link entry */}
      {!isJoined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/25 bg-[#0d0f1f]/95 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col items-center text-center gap-2 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-purple-500 text-white shadow-lg shadow-rose-500/30">
                <Heart className="h-6 w-6 fill-current animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Movie Date Invitation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {room.host_name} invited you to {room.title} ❤️
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                Enter your name below to step into your private virtual cinema for two.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJoinRoom(joinNameInput);
              }}
              className="flex flex-col gap-3.5"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Your Name</label>
                <input
                  type="text"
                  required
                  maxLength={40}
                  placeholder="What should we call you?"
                  value={joinNameInput}
                  onChange={(e) => setJoinNameInput(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isJoining || !joinNameInput.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:opacity-95 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Entering room...</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 fill-current" />
                    <span>Join Movie Date ❤️</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* In-Room Invite Partner Modal */}
      <InvitePartnerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        roomCode={room.room_code}
        roomTitle={room.title}
      />

      {/* Audio Info Modal */}
      <AudioInfoModal
        isOpen={isAudioHelpOpen}
        onClose={() => setIsAudioHelpOpen(false)}
      />

      {/* Leave Confirmation Dialog Modal */}
      <LeaveConfirmModal
        isOpen={isLeaveConfirmOpen}
        onClose={() => setIsLeaveConfirmOpen(false)}
        onConfirm={handleExecuteLeave}
        roomTitle={room.title}
      />

      {/* Delete Confirmation Dialog Modal (Host Only) */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleExecuteDelete}
        roomTitle={room.title}
        isDeleting={isDeletingRoom}
      />

      {/* Room Deleted Notice Modal (for connected participants) */}
      <RoomDeletedNoticeModal
        isOpen={isRoomDeletedNoticeOpen}
      />

      {/* Leave Summary Modal */}
      <LeaveSummaryModal
        isOpen={isLeaveModalOpen}
        roomTitle={room.title}
        durationFormatted={elapsedFormatted}
        onRejoin={() => setIsLeaveModalOpen(false)}
      />

    </div>
  );
}
