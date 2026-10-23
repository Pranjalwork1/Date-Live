'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Room, RoomEvent, Track } from 'livekit-client';
import {
  DateRoom,
  RoomMessage,
  ThemeType,
  ActiveReaction,
  ReactionPayload,
  LiveKitTokenResponse,
} from '@/lib/types';
import { THEMES } from '@/lib/themes';
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
import { Heart, Loader2, Sparkles } from 'lucide-react';

interface RoomClientProps {
  initialRoom: DateRoom;
}

export default function RoomClient({ initialRoom }: RoomClientProps) {
  const [room, setThemeRoom] = useState<DateRoom>(initialRoom);
  const [theme, setTheme] = useState<ThemeType>(initialRoom.theme || 'midnight');
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

  // Chat
  const [messages, setMessages] = useState<RoomMessage[]>([]);
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
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [elapsedFormatted, setElapsedFormatted] = useState('00:00');

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
      } else if (type === 'MESSAGE') {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
        if (!isChatOpen) {
          setUnreadCount((c) => c + 1);
        }
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
            if (prev.some((p) => p.userId === payload.userId)) return prev;
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
              },
            ];
          });
        }
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
  }, [room.room_code, currentUserId, isChatOpen, isLocalSharing, showToast, triggerReactionAnimation]);

  // Handle joining room
  const handleJoinRoom = async (name: string) => {
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
      };

      setParticipants([selfParticipant]);

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

      // Fetch existing room messages
      loadMessages();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Join error');
    } finally {
      setIsJoining(false);
    }
  };

  // Connect to LiveKit Room
  const initializeLiveKit = async (userName: string) => {
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
          } else if (track.kind === Track.Kind.Audio && publication.source === Track.Source.ScreenShareAudio) {
            const audioStream = new MediaStream([track.mediaStreamTrack]);
            setScreenAudioStream(audioStream);
            setHasTabAudio(true);
          }
        });

        lkRoom.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
          if (publication.source === Track.Source.ScreenShare) {
            setScreenStream(null);
            setIsScreenSharing(false);
            setSharerName('');
          }
        });

        lkRoom.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
          try {
            const decoded = new TextDecoder().decode(payload);
            const data = JSON.parse(decoded);
            if (data.type === 'REACTION') {
              triggerReactionAnimation(data.payload, false);
            }
          } catch (e) {
            console.error('DataReceived decode error:', e);
          }
        });

        lkRoom.on(RoomEvent.ParticipantConnected, (p) => {
          showToast(`${p.name || 'Your person'} is here ❤️`);
          setParticipants((prev) => [
            ...prev.filter((item) => item.userId !== p.identity),
            {
              userId: p.identity,
              displayName: p.name || 'Guest',
              isHost: false,
              isMuted: false,
              isSpeaking: false,
              isSharingScreen: false,
              isCameraOn: false,
            },
          ]);
        });

        await lkRoom.connect(tokenData.serverUrl, tokenData.token);
      }
    } catch (e) {
      console.warn('LiveKit cloud connection skipped, using local browser WebRTC transport:', e);
    }
  };

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

  // Chat message loading & sending
  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/messages?roomId=${room.id}`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.warn('Failed to load chat messages:', e);
    }
  };

  const handleSendMessage = async (content: string) => {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: room.id,
        senderId: currentUserId,
        senderName: displayName,
        content,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Failed to send');
    }

    setMessages((prev) => [...prev, data.message]);

    // Broadcast to partner
    broadcastChannelRef.current?.postMessage({
      type: 'MESSAGE',
      payload: data.message,
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

  // Theme change
  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    setThemeRoom((prev) => ({ ...prev, theme: newTheme }));
  };

  // Leave room cleanup
  const handleConfirmLeave = () => {
    // Stop all media tracks
    if (localScreenTrackRef.current) localScreenTrackRef.current.stop();
    if (localScreenAudioTrackRef.current) localScreenAudioTrackRef.current.stop();
    if (localMicTrackRef.current) localMicTrackRef.current.stop();
    if (lkRoomRef.current) lkRoomRef.current.disconnect();
    ambienceManager.stop();

    setIsLeaveModalOpen(true);
  };

  const currentTheme = THEMES[theme];

  return (
    <div
      className={`min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden bg-gradient-to-b ${currentTheme.bgGradient} text-white selection:bg-rose-500 selection:text-white transition-colors duration-500`}
    >
      <Starfield density={70} />

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
        participantCount={participants.length}
        isConnected={isJoined}
        onLeaveRoom={handleConfirmLeave}
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
        onLeaveRoom={handleConfirmLeave}
      />

      {/* Modal: Guest Display Name Prompt on direct link entry */}
      {!isJoined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-[#0d0f1f] p-6 text-white shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Movie Night Invitation</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{room.title}</h3>
            <p className="text-xs text-slate-300 mb-4">
              Hosted by <strong className="text-rose-300 font-semibold">{room.host_name}</strong>. Enter your name below to join the date room.
            </p>

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
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                required
                maxLength={40}
                placeholder="What should we call you?"
                value={joinNameInput}
                onChange={(e) => setJoinNameInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isJoining || !joinNameInput.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 disabled:opacity-50 transition-all active:scale-95"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Entering room...</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 fill-current" />
                    <span>Join Movie Date</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Audio Info Modal */}
      <AudioInfoModal
        isOpen={isAudioHelpOpen}
        onClose={() => setIsAudioHelpOpen(false)}
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
