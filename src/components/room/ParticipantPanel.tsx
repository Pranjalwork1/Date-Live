'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Crown, ScreenShare, VideoOff, SwitchCamera } from 'lucide-react';
import { ThemeType } from '@/lib/types';
import { THEMES, normalizeTheme } from '@/lib/themes';

export interface ParticipantState {
  userId: string;
  displayName: string;
  isHost: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isSharingScreen: boolean;
  isCameraOn: boolean;
  status: 'live' | 'offline' | 'reconnecting';
  cameraStream?: MediaStream | null;
}

interface ParticipantPanelProps {
  participants: ParticipantState[];
  currentUserId: string;
  theme?: ThemeType;
  onOpenInvite?: () => void;
  onFlipCamera?: () => void;
  cameraFacingMode?: 'user' | 'environment';
}

function LiveCameraTile({
  stream,
  isSelf,
  facingMode = 'user',
}: {
  stream: MediaStream;
  isSelf: boolean;
  facingMode?: 'user' | 'environment';
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Camera video play error:', err);
      });
    }
  }, [stream]);

  const shouldMirror = isSelf && facingMode === 'user';

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isSelf}
      className={`w-full h-full object-cover rounded-2xl transition-transform duration-300 ${
        shouldMirror ? '-scale-x-100' : ''
      }`}
    />
  );
}

export default function ParticipantPanel({
  participants,
  currentUserId,
  theme = 'midnight',
  onOpenInvite,
  onFlipCamera,
  cameraFacingMode = 'user',
}: ParticipantPanelProps) {
  const activeTheme = THEMES[normalizeTheme(theme)] || THEMES.midnight;
  const activeCount = participants.filter((p) => p.status === 'live').length;

  // Place remote participants (partner/guests) first, and self at the end
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.userId === currentUserId) return 1;
    if (b.userId === currentUserId) return -1;
    return 0;
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 w-full lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-1">
      {sortedParticipants.map((p) => {
        const isSelf = p.userId === currentUserId;
        const isLive = p.status === 'live';
        const isReconnecting = p.status === 'reconnecting';
        const isOffline = p.status === 'offline';
        const hasActiveCamera = Boolean(isLive && p.isCameraOn && p.cameraStream);

        const initials = (p.displayName || 'Guest')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div
            key={p.userId}
            className={`relative flex flex-col justify-between rounded-2xl border transition-all overflow-hidden w-full aspect-[4/3] sm:aspect-video lg:aspect-video min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] ${
              hasActiveCamera
                ? 'bg-black shadow-2xl'
                : 'p-2.5 sm:p-3'
            } ${
              isLive && p.isSpeaking
                ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_-3px_rgba(52,211,153,0.35)]'
                : isOffline
                ? 'border-white/5 bg-black/40 opacity-60 backdrop-blur-md'
                : isReconnecting
                ? 'border-amber-500/40 bg-amber-500/10 backdrop-blur-xl'
                : 'backdrop-blur-xl shadow-lg'
            }`}
            style={
              !hasActiveCamera && !isOffline && !isReconnecting && !(isLive && p.isSpeaking)
                ? {
                    backgroundColor: activeTheme.cardBg,
                    borderColor: activeTheme.cardBorder,
                    background: `radial-gradient(circle at 50% 40%, ${activeTheme.aura1} 0%, ${activeTheme.cardBg} 85%)`,
                  }
                : undefined
            }
          >
            {hasActiveCamera ? (
              /* LIVE CAMERA VIDEO TILE */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <LiveCameraTile
                  stream={p.cameraStream!}
                  isSelf={isSelf}
                  facingMode={isSelf ? cameraFacingMode : 'user'}
                />

                {/* Overlays on Camera Tile */}
                <div className="absolute inset-0 pointer-events-none p-2 sm:p-2.5 flex flex-col justify-between bg-gradient-to-t from-black/85 via-transparent to-black/45">
                  {/* Top row badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {p.isHost && (
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black shadow-sm shrink-0"
                          title="Room Host"
                        >
                          <Crown className="h-2.5 w-2.5 fill-current" />
                        </span>
                      )}
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold backdrop-blur-md shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Top-Right Camera Flip button for selfie/back camera switch */}
                      {isSelf && onFlipCamera && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFlipCamera();
                          }}
                          className="pointer-events-auto touch-manipulation flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/75 hover:bg-black/90 active:scale-90 text-white border border-white/30 hover:border-white/60 backdrop-blur-md shadow-lg transition-all cursor-pointer ring-0 hover:ring-2 hover:ring-rose-400/50"
                          title={`Switch to ${cameraFacingMode === 'user' ? 'back' : 'selfie'} camera`}
                          aria-label="Switch between selfie and back camera"
                        >
                          <SwitchCamera className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        </button>
                      )}

                      {p.isSharingScreen && (
                        <span className="p-1 rounded-full bg-rose-500/80 text-white shadow backdrop-blur-md" title="Sharing screen">
                          <ScreenShare className="h-3 w-3" />
                        </span>
                      )}
                      <span
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow backdrop-blur-md ${
                          p.isMuted
                            ? 'bg-rose-500/85 text-white'
                            : 'bg-emerald-500/85 text-white'
                        }`}
                        title={p.isMuted ? 'Muted' : 'Mic on'}
                      >
                        {p.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                        <span className="hidden sm:inline text-[9px]">{p.isMuted ? 'Muted' : 'Mic on'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom row: Display Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-white px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-md truncate max-w-[85%] border border-white/10 shadow-sm">
                      {p.displayName} {isSelf && <span className="text-slate-300 font-normal">(You)</span>}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* CAMERA OFF / SLEEK AVATAR TILE */
              <div className="relative w-full h-full flex flex-col justify-between">
                {/* Top badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {p.isHost && (
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black shadow-sm shrink-0"
                        title="Room Host"
                      >
                        <Crown className="h-2.5 w-2.5 fill-current" />
                      </span>
                    )}
                    {isLive && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live</span>
                      </span>
                    )}
                    {isReconnecting && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium shrink-0 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>Reconnecting</span>
                      </span>
                    )}
                    {isOffline && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-400 text-[10px] font-medium shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        <span>Left</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {p.isSharingScreen && (
                      <span className="p-1 rounded-full bg-rose-500/80 text-white shadow" title="Sharing screen">
                        <ScreenShare className="h-3 w-3" />
                      </span>
                    )}
                    <span
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow ${
                        p.isMuted ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/80 text-white'
                      }`}
                      title={p.isMuted ? 'Muted' : 'Mic on'}
                    >
                      {p.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      <span className="hidden sm:inline text-[9px]">{p.isMuted ? 'Muted' : 'Mic on'}</span>
                    </span>
                  </div>
                </div>

                {/* Center Avatar silhouette / initials */}
                <div className="flex flex-col items-center justify-center my-auto py-1">
                  <div className="relative">
                    <div
                      className={`relative flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full text-sm sm:text-base font-bold text-white shadow-lg transition-all ${
                        isOffline
                          ? 'bg-slate-700/80 text-slate-300'
                          : p.isHost
                          ? 'bg-gradient-to-tr from-rose-500 to-pink-500 ring-2 ring-rose-400/30'
                          : 'bg-gradient-to-tr from-purple-500 to-indigo-500 ring-2 ring-purple-400/30'
                      }`}
                    >
                      {initials}
                    </div>

                    {/* Speaking pulse ring */}
                    {isLive && p.isSpeaking && (
                      <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <VideoOff className="h-2.5 w-2.5" />
                    <span>Cam off</span>
                  </span>
                </div>

                {/* Bottom Display Name */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-semibold text-white px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md truncate max-w-[85%] border border-white/10">
                    {p.displayName} {isSelf && <span className="text-slate-300 font-normal">(You)</span>}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Waiting for partner tile if only 1 participant */}
      {activeCount < 2 && !participants.some((p) => p.userId !== currentUserId && p.status === 'live') && (
        <div className="relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-rose-500/30 bg-rose-500/5 aspect-[4/3] sm:aspect-video lg:aspect-video min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] text-center backdrop-blur-md group hover:border-rose-500/50 transition-all">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-dashed border-rose-400/40 text-rose-400 text-lg mb-1 animate-pulse">
            💌
          </div>
          <span className="text-xs font-semibold text-rose-200">Waiting for partner</span>
          <span className="text-[10px] text-slate-400 mb-2">Invite them to watch together</span>
          {onOpenInvite && (
            <button
              onClick={onOpenInvite}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Invite ❤️
            </button>
          )}
        </div>
      )}
    </div>
  );
}
