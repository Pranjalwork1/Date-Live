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
import { Heart, Loader2, Sparkles, RefreshCw, LogIn } from 'lucide-react';

interface RoomClientProps {
  initialRoom: DateRoom;
}

export default function RoomClient({ initialRoom }: RoomClientProps) {
  const router = useRouter();
  const [room, setThemeRoom] = useState<DateRoom>(initialRoom);
  const [theme, setTheme] = useState<ThemeType>(() => normalizeTheme(initialRoom.theme));

  // Stable, distinct participant identity isolated per tab/session to prevent tab collisions
  const [currentUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const sessionKey = `moonlit_session_user_${initialRoom.room_code}`;
      let sessionUserId = sessionStorage.getItem(sessionKey);
      if (!sessionUserId) {
        const localHostId = localStorage.getItem('moonlit_user_id');
        if (localHostId && localHostId === initialRoom.host_user_id) {
          sessionUserId = localHostId;
        } else {
          sessionUserId = `usr_${Math.random().toString(36).substring(2, 10)}`;
        }
        sessionStorage.setItem(sessionKey, sessionUserId);
      }
      return sessionUserId;
    }
    return '';
  });

  const [displayName, setDisplayName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const sessionName = sessionStorage.getItem(`moonlit_name_${initialRoom.room_code}`);
      if (sessionName) return sessionName;
      return localStorage.getItem('moonlit_name') || '';
    }
    return '';
  });

  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinNameInput, setJoinNameInput] = useState(() => {
    if (typeof window !== 'undefined') {
      const sessionName = sessionStorage.getItem(`moonlit_name_${initialRoom.room_code}`);
      if (sessionName) return sessionName;
      return localStorage.getItem('moonlit_name') || '';
    }
    return '';
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Duplicate name resolution state
  const [nameConflict, setNameConflict] = useState<{
    originalName: string;
    suggestions: string[];
  } | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  // Real-time Media States
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenAudioStream, setScreenAudioStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLocalSharing, setIsLocalSharing] = useState(false);
  const [sharerName, setSharerName] = useState<string>('');
  const [hasTabAudio, setHasTabAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');

  // LiveKit Instance & Track Refs
  const lkRoomRef = useRef<Room | null>(null);
  const localScreenTrackRef = useRef<MediaStreamTrack | null>(null);
  const localScreenAudioTrackRef = useRef<MediaStreamTrack | null>(null);
  const localMicTrackRef = useRef<MediaStreamTrack | null>(null);
  const localCameraTrackRef = useRef<MediaStreamTrack | null>(null);

  // Participants
  const [participants, setParticipants] = useState<ParticipantState[]>([]);

  // Chat - Local-only, sender-only messages (isolated by roomCode and currentUserId)
  const [messages, setMessages] = useState<RoomMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const sessionKey = `moonlit_session_user_${initialRoom.room_code}`;
        const uid = sessionStorage.getItem(sessionKey) || localStorage.getItem('moonlit_user_id') || '';
        const code = initialRoom.room_code;
        if (uid && code) {
          const storageKey = `moonlit_local_msgs_${code}_${uid}`;
          const saved = sessionStorage.getItem(storageKey);
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
        try {
          const payloadBytes = new TextEncoder().encode(
            JSON.stringify({ type: 'REACTION', payload })
          );
          void lkRoomRef.current.localParticipant.publishData(payloadBytes, { reliable: true });
        } catch {
          // safe
        }
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
                isMuted: true,
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
                    isCameraOn: false,
                    cameraStream: null,
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
        if (localCameraTrackRef.current) {
          localCameraTrackRef.current.stop();
          localCameraTrackRef.current = null;
        }
        ambienceManager.stop();
        try {
          const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
          sessionStorage.removeItem(storageKey);
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
      } else if (type === 'MIC_MUTED_CHANGED') {
        const { userId, isMuted: targetMuted } = payload || {};
        if (userId && userId !== currentUserId) {
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === userId ? { ...p, isMuted: Boolean(targetMuted) } : p
            )
          );
        }
      } else if (type === 'CAMERA_STATE_CHANGED') {
        const { userId, isCameraOn: targetCam } = payload || {};
        if (userId && userId !== currentUserId) {
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === userId ? { ...p, isCameraOn: Boolean(targetCam) } : p
            )
          );
        }
      } else if (type === 'CHAT_MESSAGE') {
        const incomingMsg = payload as RoomMessage;
        if (incomingMsg && incomingMsg.sender_id !== currentUserId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            const updated = [...prev, incomingMsg];
            if (typeof window !== 'undefined' && currentUserId && room.room_code) {
              try {
                const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
                sessionStorage.setItem(storageKey, JSON.stringify(updated));
              } catch {
                // safe
              }
            }
            return updated;
          });
          setIsChatOpen((isOpen) => {
            if (!isOpen) {
              setUnreadCount((count) => count + 1);
              showToast(`💬 ${incomingMsg.sender_name}: ${incomingMsg.content.slice(0, 30)}${incomingMsg.content.length > 30 ? '...' : ''}`);
            }
            return isOpen;
          });
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

        // Remote track subscriptions
        lkRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Video) {
            if (publication.source === Track.Source.ScreenShare) {
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
            } else if (publication.source === Track.Source.Camera) {
              const camStream = new MediaStream([track.mediaStreamTrack]);
              setParticipants((prev) =>
                prev.map((p) =>
                  p.userId === participant.identity
                    ? { ...p, isCameraOn: true, cameraStream: camStream }
                    : p
                )
              );
            }
          } else if (track.kind === Track.Kind.Audio) {
            if (publication.source === Track.Source.ScreenShareAudio) {
              const audioStream = new MediaStream([track.mediaStreamTrack]);
              setScreenAudioStream(audioStream);
              setHasTabAudio(true);
            } else if (publication.source === Track.Source.Microphone) {
              // Attach and play remote microphone audio
              track.attach();
              setParticipants((prev) =>
                prev.map((p) =>
                  p.userId === participant.identity ? { ...p, isMuted: false } : p
                )
              );
            }
          }
        });

        // Remote track unsubscriptions
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
          } else if (publication.source === Track.Source.ScreenShareAudio) {
            setScreenAudioStream(null);
            setHasTabAudio(false);
          } else if (publication.source === Track.Source.Camera) {
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === participant.identity
                  ? { ...p, isCameraOn: false, cameraStream: null }
                  : p
              )
            );
          } else if (publication.source === Track.Source.Microphone) {
            track.detach();
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === participant.identity ? { ...p, isMuted: true } : p
              )
            );
          }
        });

        lkRoom.on(RoomEvent.TrackMuted, (publication, participant) => {
          if (
            publication.source === Track.Source.Microphone ||
            (publication.kind === Track.Kind.Audio && publication.source !== Track.Source.ScreenShareAudio)
          ) {
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === participant.identity ? { ...p, isMuted: true } : p
              )
            );
          }
        });

        lkRoom.on(RoomEvent.TrackUnmuted, (publication, participant) => {
          if (
            publication.source === Track.Source.Microphone ||
            (publication.kind === Track.Kind.Audio && publication.source !== Track.Source.ScreenShareAudio)
          ) {
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
              if (localCameraTrackRef.current) {
                localCameraTrackRef.current.stop();
                localCameraTrackRef.current = null;
              }
              ambienceManager.stop();
              try {
                const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
                sessionStorage.removeItem(storageKey);
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
                          isCameraOn: false,
                          cameraStream: null,
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
            } else if (data.type === 'MIC_MUTED_CHANGED') {
              const { userId, isMuted: targetMuted } = data.payload || {};
              if (userId && userId !== currentUserId) {
                setParticipants((prev) =>
                  prev.map((p) =>
                    p.userId === userId ? { ...p, isMuted: Boolean(targetMuted) } : p
                  )
                );
              }
            } else if (data.type === 'CAMERA_STATE_CHANGED') {
              const { userId, isCameraOn: targetCam } = data.payload || {};
              if (userId && userId !== currentUserId) {
                setParticipants((prev) =>
                  prev.map((p) =>
                    p.userId === userId ? { ...p, isCameraOn: Boolean(targetCam) } : p
                  )
                );
              }
            } else if (data.type === 'CHAT_MESSAGE') {
              const incomingMsg = data.payload as RoomMessage;
              if (incomingMsg && incomingMsg.sender_id !== currentUserId) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === incomingMsg.id)) return prev;
                  const updated = [...prev, incomingMsg];
                  if (typeof window !== 'undefined' && currentUserId && room.room_code) {
                    try {
                      const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
                      sessionStorage.setItem(storageKey, JSON.stringify(updated));
                    } catch {
                      // safe
                    }
                  }
                  return updated;
                });
                setIsChatOpen((isOpen) => {
                  if (!isOpen) {
                    setUnreadCount((count) => count + 1);
                    showToast(`💬 ${incomingMsg.sender_name}: ${incomingMsg.content.slice(0, 30)}${incomingMsg.content.length > 30 ? '...' : ''}`);
                  }
                  return isOpen;
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
                    isCameraOn: false,
                    cameraStream: null,
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

        // Connection quality monitoring
        lkRoom.on(RoomEvent.ConnectionQualityChanged, (quality: ConnectionQuality, p: Participant) => {
          const isTargetSelf = p.identity === currentUserId;
          const targetId = isTargetSelf ? currentUserId : p.identity;

          if (quality === ConnectionQuality.Lost) {
            setParticipants((prev) =>
              prev.map((item) =>
                item.userId === targetId ? { ...item, status: 'reconnecting' as const } : item
              )
            );
          } else if (
            quality === ConnectionQuality.Good ||
            quality === ConnectionQuality.Excellent ||
            quality === ConnectionQuality.Poor
          ) {
            setParticipants((prev) =>
              prev.map((item) =>
                item.userId === targetId && item.status === 'reconnecting'
                  ? { ...item, status: 'live' as const }
                  : item
              )
            );
          }
        });

        lkRoom.on(RoomEvent.Reconnecting, () => {
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === currentUserId ? { ...p, status: 'reconnecting' as const } : p
            )
          );
        });

        lkRoom.on(RoomEvent.Reconnected, () => {
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === currentUserId ? { ...p, status: 'live' as const } : p
            )
          );
        });

        lkRoom.on(RoomEvent.Disconnected, () => {
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === currentUserId ? { ...p, status: 'offline' as const } : p
            )
          );
        });

        await lkRoom.connect(tokenData.serverUrl, tokenData.token);

        // Populate participants and inspect any active tracks already published in the room
        lkRoom.remoteParticipants.forEach((p) => {
          let pCameraStream: MediaStream | null = null;
          let pIsCameraOn = false;
          let pIsSharing = false;

          p.trackPublications.forEach((pub) => {
            if (pub.isSubscribed && pub.track) {
              if (pub.source === Track.Source.ScreenShare && pub.track.kind === Track.Kind.Video) {
                setScreenStream(new MediaStream([pub.track.mediaStreamTrack]));
                setIsScreenSharing(true);
                setIsLocalSharing(false);
                setSharerName(p.name || 'Partner');
                pIsSharing = true;
              } else if (pub.source === Track.Source.ScreenShareAudio && pub.track.kind === Track.Kind.Audio) {
                setScreenAudioStream(new MediaStream([pub.track.mediaStreamTrack]));
                setHasTabAudio(true);
              } else if (pub.source === Track.Source.Camera && pub.track.kind === Track.Kind.Video) {
                pCameraStream = new MediaStream([pub.track.mediaStreamTrack]);
                pIsCameraOn = true;
              } else if (pub.source === Track.Source.Microphone && pub.track.kind === Track.Kind.Audio) {
                pub.track.attach();
              }
            }
          });

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
                      isSharingScreen: pIsSharing || p.isScreenShareEnabled,
                      isCameraOn: pIsCameraOn || item.isCameraOn,
                      cameraStream: pCameraStream || item.cameraStream,
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
                isSharingScreen: pIsSharing || p.isScreenShareEnabled,
                isCameraOn: pIsCameraOn,
                cameraStream: pCameraStream,
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
    const cleanName = name.trim();
    if (!cleanName) return;
    setIsJoining(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: room.room_code,
          displayName: cleanName,
          userId: currentUserId,
        }),
      });

      const data = await res.json();
      if (res.status === 409 || data.nameTaken) {
        setNameConflict({
          originalName: data.originalName || cleanName,
          suggestions: (data.suggestions || []).slice(0, 3),
        });
        setSelectedSuggestion(null);
        setIsJoining(false);
        return;
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to join room');
      }

      const finalName = data.member?.display_name || cleanName;
      setNameConflict(null);
      setDisplayName(finalName);

      if (typeof window !== 'undefined') {
        localStorage.setItem('moonlit_name', finalName);
        sessionStorage.setItem(`moonlit_name_${room.room_code}`, finalName);
      }

      setIsJoined(true);

      const isHost = currentUserId === room.host_user_id || data.member?.role === 'host';
      const selfParticipant: ParticipantState = {
        userId: currentUserId,
        displayName: finalName,
        isHost,
        isMuted,
        isSpeaking: false,
        isSharingScreen: false,
        isCameraOn,
        cameraStream: localCameraTrackRef.current ? new MediaStream([localCameraTrackRef.current]) : null,
        status: 'live',
      };

      setParticipants((prev) => {
        const others = prev.filter((p) => p.userId !== currentUserId);
        return [selfParticipant, ...others];
      });

      broadcastChannelRef.current?.postMessage({
        type: 'PARTICIPANT_JOINED',
        payload: {
          userId: currentUserId,
          displayName: finalName,
          role: isHost ? 'host' : 'guest',
        },
      });

      await initializeLiveKit(finalName);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Join error');
    } finally {
      setIsJoining(false);
    }
  }, [room.room_code, room.host_user_id, currentUserId, isMuted, isCameraOn, initializeLiveKit]);

  // Request fresh name suggestions when clicking "Generate more options"
  const handleGenerateMoreOptions = async () => {
    if (!nameConflict) return;
    setIsGeneratingMore(true);
    try {
      const res = await fetch(
        `/api/room/name-options?roomCode=${encodeURIComponent(
          room.room_code
        )}&name=${encodeURIComponent(nameConflict.originalName)}`
      );
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setNameConflict((prev) =>
          prev ? { ...prev, suggestions: data.suggestions.slice(0, 3) } : null
        );
        setSelectedSuggestion(null);
      }
    } catch {
      // safe fallback
    } finally {
      setIsGeneratingMore(false);
    }
  };

  // Auto-join for host who created the room OR guest who already picked their name
  useEffect(() => {
    if (autoJoinedRef.current) return;
    const sessionName = typeof window !== 'undefined'
      ? sessionStorage.getItem(`moonlit_name_${room.room_code}`)
      : null;
    const isHost = Boolean(currentUserId && currentUserId === room.host_user_id);

    if (!isJoined && (isHost || sessionName)) {
      autoJoinedRef.current = true;
      const targetName = sessionName || displayName || (isHost ? room.host_name : '');
      if (targetName) {
        const timer = setTimeout(() => {
          void handleJoinRoom(targetName);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUserId, room.host_user_id, room.host_name, room.room_code, displayName, isJoined, handleJoinRoom]);

  // Screen Sharing Trigger: Exactly ONE browser prompt per user click!
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
      if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
        try {
          await lkRoomRef.current.localParticipant.setScreenShareEnabled(false);
        } catch {
          // safe
        }
      }
      setScreenStream(null);
      setScreenAudioStream(null);
      setIsScreenSharing(false);
      setIsLocalSharing(false);
      setHasTabAudio(false);
      setParticipants((prev) =>
        prev.map((p) => (p.userId === currentUserId ? { ...p, isSharingScreen: false } : p))
      );

      broadcastChannelRef.current?.postMessage({ type: 'SCREEN_SHARE_STOPPED' });
      return;
    }

    try {
      if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
        // Direct LiveKit integrated screen sharing with audio - prompts the user ONCE
        await lkRoomRef.current.localParticipant.setScreenShareEnabled(true, {
          audio: true,
          selfBrowserSurface: 'include',
          surfaceSwitching: 'include',
          systemAudio: 'include',
        });

        const screenPub = lkRoomRef.current.localParticipant.getTrackPublication(Track.Source.ScreenShare);
        const videoTrack = screenPub?.videoTrack?.mediaStreamTrack;

        if (videoTrack) {
          localScreenTrackRef.current = videoTrack;
          setScreenStream(new MediaStream([videoTrack]));
          setIsScreenSharing(true);
          setIsLocalSharing(true);
          setSharerName(displayName || 'You');

          videoTrack.onended = () => {
            void handleToggleScreenShare();
          };
        }

        const audioPub = lkRoomRef.current.localParticipant.getTrackPublication(Track.Source.ScreenShareAudio);
        const audioTrack = audioPub?.audioTrack?.mediaStreamTrack;
        if (audioTrack) {
          localScreenAudioTrackRef.current = audioTrack;
          setScreenAudioStream(new MediaStream([audioTrack]));
          setHasTabAudio(true);
        } else {
          setHasTabAudio(false);
        }

        setParticipants((prev) =>
          prev.map((p) => (p.userId === currentUserId ? { ...p, isSharingScreen: true } : p))
        );
      } else {
        // Fallback local capture (mock/dev mode)
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

        setParticipants((prev) =>
          prev.map((p) => (p.userId === currentUserId ? { ...p, isSharingScreen: true } : p))
        );

        videoTrack.onended = () => {
          void handleToggleScreenShare();
        };
      }
    } catch (err: unknown) {
      console.warn('Screen share canceled or failed:', err);
    }
  };

  // Camera toggle (Live Video Calling)
  const handleToggleCamera = async () => {
    const nextCameraOn = !isCameraOn;

    try {
      if (nextCameraOn) {
        if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
          await lkRoomRef.current.localParticipant.setCameraEnabled(true, {
            facingMode: cameraFacingMode,
          });
          const camPub = lkRoomRef.current.localParticipant.getTrackPublication(Track.Source.Camera);
          const track = camPub?.videoTrack?.mediaStreamTrack;
          if (track) {
            localCameraTrackRef.current = track;
            const stream = new MediaStream([track]);
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === currentUserId ? { ...p, isCameraOn: true, cameraStream: stream } : p
              )
            );
          }
        } else {
          const userMedia = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: cameraFacingMode },
          });
          const track = userMedia.getVideoTracks()[0];
          if (track) {
            localCameraTrackRef.current = track;
            const stream = new MediaStream([track]);
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === currentUserId ? { ...p, isCameraOn: true, cameraStream: stream } : p
              )
            );
          }
        }
        setIsCameraOn(true);
        const camPayloadOn = {
          type: 'CAMERA_STATE_CHANGED',
          payload: { userId: currentUserId, isCameraOn: true },
        };
        if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
          try {
            const payloadBytes = new TextEncoder().encode(JSON.stringify(camPayloadOn));
            void lkRoomRef.current.localParticipant.publishData(payloadBytes, { reliable: true });
          } catch {
            // safe
          }
        }
        broadcastChannelRef.current?.postMessage(camPayloadOn);
      } else {
        if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
          await lkRoomRef.current.localParticipant.setCameraEnabled(false);
        }
        if (localCameraTrackRef.current) {
          localCameraTrackRef.current.stop();
          localCameraTrackRef.current = null;
        }
        setParticipants((prev) =>
          prev.map((p) =>
            p.userId === currentUserId ? { ...p, isCameraOn: false, cameraStream: null } : p
          )
        );
        setIsCameraOn(false);
        const camPayloadOff = {
          type: 'CAMERA_STATE_CHANGED',
          payload: { userId: currentUserId, isCameraOn: false },
        };
        if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
          try {
            const payloadBytes = new TextEncoder().encode(JSON.stringify(camPayloadOff));
            void lkRoomRef.current.localParticipant.publishData(payloadBytes, { reliable: true });
          } catch {
            // safe
          }
        }
        broadcastChannelRef.current?.postMessage(camPayloadOff);
      }
    } catch (e) {
      console.warn('Camera toggle error:', e);
      setIsCameraOn(false);
      showToast('Camera unavailable or permission denied.');
    }
  };

  // Switch camera between selfie (front) and back camera
  const handleFlipCamera = async () => {
    if (!isCameraOn) return;
    const nextMode: 'user' | 'environment' = cameraFacingMode === 'user' ? 'environment' : 'user';

    try {
      if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
        const camPub = lkRoomRef.current.localParticipant.getTrackPublication(Track.Source.Camera);
        if (camPub?.videoTrack) {
          await camPub.videoTrack.restartTrack({ facingMode: nextMode });
          const track = camPub.videoTrack.mediaStreamTrack;
          if (track) {
            localCameraTrackRef.current = track;
            const stream = new MediaStream([track]);
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === currentUserId ? { ...p, isCameraOn: true, cameraStream: stream } : p
              )
            );
          }
        } else {
          await lkRoomRef.current.localParticipant.setCameraEnabled(true, { facingMode: nextMode });
          const newPub = lkRoomRef.current.localParticipant.getTrackPublication(Track.Source.Camera);
          const track = newPub?.videoTrack?.mediaStreamTrack;
          if (track) {
            localCameraTrackRef.current = track;
            const stream = new MediaStream([track]);
            setParticipants((prev) =>
              prev.map((p) =>
                p.userId === currentUserId ? { ...p, isCameraOn: true, cameraStream: stream } : p
              )
            );
          }
        }
      } else {
        const oldTrack = localCameraTrackRef.current;
        const userMedia = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: nextMode } },
        });
        const track = userMedia.getVideoTracks()[0];
        if (track) {
          if (oldTrack) {
            oldTrack.stop();
          }
          localCameraTrackRef.current = track;
          const stream = new MediaStream([track]);
          setParticipants((prev) =>
            prev.map((p) =>
              p.userId === currentUserId ? { ...p, isCameraOn: true, cameraStream: stream } : p
            )
          );
        }
      }
      setCameraFacingMode(nextMode);
      showToast(nextMode === 'user' ? 'Switched to selfie camera' : 'Switched to back camera');
    } catch (err: unknown) {
      console.warn('Failed to switch camera:', err);
      showToast('Unable to switch camera. Back/front camera may not be available on this device.');
    }
  };

  // Microphone toggle (Live Real-Time Voice Calling)
  const handleToggleMic = async () => {
    const nextMuted = !isMuted;

    try {
      if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
        await lkRoomRef.current.localParticipant.setMicrophoneEnabled(!nextMuted);
        const micPub = lkRoomRef.current.localParticipant.getTrackPublication(Track.Source.Microphone);
        if (micPub?.audioTrack?.mediaStreamTrack) {
          localMicTrackRef.current = micPub.audioTrack.mediaStreamTrack;
        }
      } else {
        if (!nextMuted) {
          if (!localMicTrackRef.current || localMicTrackRef.current.readyState === 'ended') {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localMicTrackRef.current = micStream.getAudioTracks()[0];
          } else {
            localMicTrackRef.current.enabled = true;
          }
        } else {
          if (localMicTrackRef.current) {
            localMicTrackRef.current.enabled = false;
          }
        }
      }

      setIsMuted(nextMuted);
      setParticipants((prev) =>
        prev.map((p) => (p.userId === currentUserId ? { ...p, isMuted: nextMuted } : p))
      );

      // Broadcast mic state to room peers
      const micPayload = {
        type: 'MIC_MUTED_CHANGED',
        payload: { userId: currentUserId, isMuted: nextMuted },
      };

      if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
        try {
          const payloadBytes = new TextEncoder().encode(JSON.stringify(micPayload));
          void lkRoomRef.current.localParticipant.publishData(payloadBytes, { reliable: true });
        } catch {
          // safe
        }
      }

      broadcastChannelRef.current?.postMessage(micPayload);
    } catch (e) {
      console.warn('Microphone error:', e);
      setIsMuted(true);
      setParticipants((prev) =>
        prev.map((p) => (p.userId === currentUserId ? { ...p, isMuted: true } : p))
      );
      showToast('Microphone unavailable or permission denied.');
    }
  };

  const handleSelectReaction = (emoji: string) => {
    const now = Date.now();
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

  // Chat message sending - Real-time broadcast to room members
  const handleSendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const newMessage: RoomMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      room_id: room.id,
      sender_id: currentUserId,
      sender_name: displayName || 'Guest',
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    // 1. Add to local state & persist
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      if (typeof window !== 'undefined' && currentUserId && room.room_code) {
        try {
          const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
          sessionStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // safe fallback
        }
      }
      return updated;
    });

    const chatPayload = {
      type: 'CHAT_MESSAGE',
      payload: newMessage,
    };

    // 2. Broadcast via LiveKit Data Channel to all remote room members
    if (lkRoomRef.current && lkRoomRef.current.state === 'connected') {
      try {
        const payloadBytes = new TextEncoder().encode(JSON.stringify(chatPayload));
        void lkRoomRef.current.localParticipant.publishData(payloadBytes, { reliable: true });
      } catch (err) {
        console.warn('LiveKit chat broadcast error:', err);
      }
    }

    // 3. Broadcast via BroadcastChannel for multi-tab / local network fallback
    try {
      broadcastChannelRef.current?.postMessage(chatPayload);
    } catch (err) {
      console.warn('BroadcastChannel chat error:', err);
    }
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

    broadcastChannelRef.current?.postMessage({
      type: 'THEME_CHANGED',
      payload: { theme: normalized, userId: currentUserId, displayName },
    });

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

  // Leave room execution
  const handleExecuteLeave = useCallback(() => {
    setIsLeaveConfirmOpen(false);

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

    broadcastChannelRef.current?.postMessage({
      type: 'PARTICIPANT_LEFT',
      payload: { userId: currentUserId, displayName },
    });

    try {
      void fetch('/api/room/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: room.room_code, userId: currentUserId }),
      });
    } catch {
      // ignore
    }

    setParticipants((prev) =>
      prev.map((p) => (p.userId === currentUserId ? { ...p, status: 'offline' as const } : p))
    );

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
    if (localCameraTrackRef.current) {
      localCameraTrackRef.current.stop();
      localCameraTrackRef.current = null;
    }
    if (lkRoomRef.current) {
      lkRoomRef.current.disconnect();
      lkRoomRef.current = null;
    }
    ambienceManager.stop();

    try {
      const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
      sessionStorage.removeItem(storageKey);
    } catch {
      // safe
    }

    router.push('/');
  }, [currentUserId, displayName, room.room_code, router]);

  // Delete room execution (Host only)
  const handleExecuteDelete = useCallback(async () => {
    if (currentUserId !== room.host_user_id) {
      showToast('Only the authorized room creator can delete this room');
      return;
    }

    setIsDeletingRoom(true);

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

    broadcastChannelRef.current?.postMessage({
      type: 'ROOM_DELETED',
      payload: { roomCode: room.room_code, hostUserId: currentUserId },
    });

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
      showToast(err instanceof Error ? err.message : 'Error deleting room');
      setIsDeletingRoom(false);
      return;
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
    if (localCameraTrackRef.current) {
      localCameraTrackRef.current.stop();
      localCameraTrackRef.current = null;
    }
    if (lkRoomRef.current) {
      lkRoomRef.current.disconnect();
      lkRoomRef.current = null;
    }
    ambienceManager.stop();

    try {
      const storageKey = `moonlit_local_msgs_${room.room_code}_${currentUserId}`;
      sessionStorage.removeItem(storageKey);
    } catch {
      // safe
    }

    setIsDeleteConfirmOpen(false);
    setIsDeletingRoom(false);
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
      if (localScreenTrackRef.current) {
        localScreenTrackRef.current.stop();
      }
      if (localScreenAudioTrackRef.current) {
        localScreenAudioTrackRef.current.stop();
      }
      if (localMicTrackRef.current) {
        localMicTrackRef.current.stop();
      }
      if (localCameraTrackRef.current) {
        localCameraTrackRef.current.stop();
      }
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
      <main
        className={`relative flex-1 flex flex-col px-2.5 sm:px-4 lg:px-5 pt-16 sm:pt-18 lg:pt-20 pb-20 sm:pb-24 max-w-[1600px] mx-auto w-full z-10 transition-all duration-300 ${
          isChatOpen ? 'lg:mr-80 xl:mr-96' : ''
        }`}
      >
        <div className="flex-1 flex flex-col lg:flex-row gap-2.5 sm:gap-4 items-start min-w-0">
          {/* Screen Share Stage — full width on mobile, flex-1 on desktop */}
          <div className="flex-1 w-full min-w-0 flex flex-col">
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
          </div>

          {/* Camera cards — side-by-side 2-col grid on mobile, vertical column on desktop */}
          {!isTheaterMode && (
            <div className="w-full lg:w-68 xl:w-76 2xl:w-88 shrink-0 flex flex-col">
              <ParticipantPanel
                participants={participants}
                currentUserId={currentUserId}
                theme={theme}
                onOpenInvite={() => setIsInviteModalOpen(true)}
                onFlipCamera={handleFlipCamera}
                cameraFacingMode={cameraFacingMode}
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

      {/* Control Dock with Camera, Mic, Screen Share, Chat, and Ambience */}
      <ControlDock
        isMuted={isMuted}
        onToggleMic={handleToggleMic}
        isCameraOn={isCameraOn}
        onToggleCamera={handleToggleCamera}
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
                Enter your name below to step into your private virtual cinema.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            {nameConflict ? (
              /* Choose your display name - Duplicate name selector */
              <div className="flex flex-col gap-4 animate-fade-in text-left">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white mb-1">
                    This name is already taken in this room.
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Choose an available display name to continue.
                  </p>
                </div>

                {/* Exactly three selectable suggestion options */}
                <div className="flex flex-col gap-2">
                  {nameConflict.suggestions.slice(0, 3).map((suggestion) => {
                    const isSelected = selectedSuggestion === suggestion;
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        disabled={isJoining}
                        onClick={() => {
                          setSelectedSuggestion(suggestion);
                          setErrorMessage(null);
                        }}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl border transition-all shadow-md active:scale-[0.98] cursor-pointer ${
                          isSelected
                            ? 'border-purple-400 bg-gradient-to-r from-purple-500/25 to-indigo-500/25 ring-2 ring-purple-400/50 shadow-[0_0_20px_-3px_rgba(168,85,247,0.35)]'
                            : 'border-white/10 bg-white/5 hover:border-purple-500/40 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                              isSelected
                                ? 'border-purple-400 bg-purple-500 text-white'
                                : 'border-white/30 bg-transparent'
                            }`}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <span
                            className={`font-semibold text-sm transition-colors ${
                              isSelected ? 'text-white' : 'text-slate-200'
                            }`}
                          >
                            {suggestion}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-all ${
                            isSelected
                              ? 'bg-purple-500 text-white shadow-sm'
                              : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Available'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Controls: Generate More & Change Name */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isGeneratingMore || isJoining}
                    onClick={handleGenerateMoreOptions}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-white/20 text-xs font-medium text-slate-300 hover:text-white hover:border-purple-400/50 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 text-purple-400 ${isGeneratingMore ? 'animate-spin' : ''}`}
                    />
                    <span>{isGeneratingMore ? 'Generating...' : 'Generate More'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isJoining}
                    onClick={() => {
                      setNameConflict(null);
                      setSelectedSuggestion(null);
                    }}
                    className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    Change Name
                  </button>
                </div>

                {/* Join Room confirmation CTA button */}
                <button
                  type="button"
                  disabled={!selectedSuggestion || isJoining}
                  onClick={() => {
                    if (selectedSuggestion) {
                      void handleJoinRoom(selectedSuggestion);
                    }
                  }}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Joining Room...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span>Join Room</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Standard guest name input form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleJoinRoom(joinNameInput);
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
            )}
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
