'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Crown, ScreenShare, VideoOff } from 'lucide-react';
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
}

function LiveCameraTile({
  stream,
  isSelf,
}: {
  stream: MediaStream;
  isSelf: boolean;
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

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isSelf}
      className="w-full h-full object-cover rounded-2xl"
    />
  );
}

export default function ParticipantPanel({
  participants,
  currentUserId,
  theme = 'midnight',
}: ParticipantPanelProps) {
  const activeTheme = THEMES[normalizeTheme(theme)] || THEMES.midnight;
  const activeCount = participants.filter((p) => p.status === 'live').length;

  return (
    <div className="flex flex-row flex-wrap gap-3.5 items-stretch overflow-x-auto pb-2">
      {participants.map((p) => {
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
            className={`relative flex flex-col justify-between rounded-2xl border transition-all overflow-hidden ${
              hasActiveCamera
                ? 'w-48 sm:w-56 h-36 sm:h-40 bg-black/90 shadow-2xl'
                : 'min-w-[180px] sm:min-w-[220px] p-3'
            } ${
              isLive && p.isSpeaking
                ? 'border-emerald-400/80 ring-2 ring-emerald-400/30 shadow-[0_0_20px_-3px_rgba(52,211,153,0.35)]'
                : isOffline
                ? 'border-white/5 bg-black/20 opacity-60 backdrop-blur-md'
                : isReconnecting
                ? 'border-amber-500/40 bg-amber-500/5 backdrop-blur-xl'
                : 'backdrop-blur-xl shadow-lg'
            }`}
            style={
              !hasActiveCamera && !isOffline && !isReconnecting && !(isLive && p.isSpeaking)
                ? {
                    backgroundColor: activeTheme.cardBg,
                    borderColor: activeTheme.cardBorder,
                  }
                : undefined
            }
          >
            {hasActiveCamera ? (
              /* LIVE CAMERA VIDEO TILE */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <LiveCameraTile stream={p.cameraStream!} isSelf={isSelf} />

                {/* Overlays on Camera Tile */}
                <div className="absolute inset-0 pointer-events-none p-2.5 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/30">
                  {/* Top row badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {p.isHost && (
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black shadow-sm"
                          title="Room Host"
                        >
                          <Crown className="h-2.5 w-2.5 fill-current" />
                        </span>
                      )}
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {p.isSharingScreen && (
                        <span className="p-1 rounded-full bg-rose-500/80 text-white shadow" title="Sharing screen">
                          <ScreenShare className="h-3 w-3" />
                        </span>
                      )}
                      <span
                        className={`p-1 rounded-full shadow ${
                          p.isMuted ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/80 text-white'
                        }`}
                        title={p.isMuted ? 'Muted' : 'Mic on'}
                      >
                        {p.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      </span>
                    </div>
                  </div>

                  {/* Bottom row: Display Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md truncate max-w-[130px] sm:max-w-[160px]">
                      {p.displayName} {isSelf && <span className="text-slate-300 font-normal">(You)</span>}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* CAMERA OFF / AVATAR CARD */
              <div className="flex items-center gap-3">
                {/* Avatar with speaking wave */}
                <div className="relative shrink-0">
                  <div
                    className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-sm sm:text-base font-bold text-white shadow-md transition-all ${
                      isOffline
                        ? 'bg-slate-700/80 text-slate-300'
                        : p.isHost
                        ? 'bg-gradient-to-tr from-rose-500 to-pink-500'
                        : 'bg-gradient-to-tr from-purple-500 to-indigo-500'
                    }`}
                  >
                    {initials}

                    {/* Host crown badge */}
                    {p.isHost && (
                      <span
                        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black shadow-sm"
                        title="Room Host"
                      >
                        <Crown className="h-2.5 w-2.5 fill-current" />
                      </span>
                    )}
                  </div>

                  {/* Pulsing Speaking Halo (only when live) */}
                  {isLive && p.isSpeaking && (
                    <span className="absolute -inset-1 rounded-full border-2 border-emerald-400/80 animate-ping pointer-events-none" />
                  )}
                </div>

                {/* Info & Status */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[100px] sm:max-w-[130px]">
                      {p.displayName} {isSelf && <span className="text-slate-400 font-normal">(You)</span>}
                    </span>

                    {/* Status Badges */}
                    {isLive && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live</span>
                      </span>
                    )}
                    {isReconnecting && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium shrink-0 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>Reconnecting...</span>
                      </span>
                    )}
                    {isOffline && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-400 text-[10px] font-medium shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        <span>Left</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    {isOffline ? (
                      <span className="text-[10px] text-slate-400">Offline</span>
                    ) : (
                      <>
                        {/* Mic status */}
                        <span className="flex items-center gap-1">
                          {p.isMuted ? (
                            <MicOff className="h-3 w-3 text-rose-400" />
                          ) : (
                            <Mic className="h-3 w-3 text-emerald-400" />
                          )}
                          <span className={p.isMuted ? 'text-rose-400/90' : 'text-slate-300'}>
                            {p.isMuted ? 'Muted' : 'Mic on'}
                          </span>
                        </span>

                        {/* Camera status */}
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <VideoOff className="h-3 w-3" />
                          <span>Cam off</span>
                        </span>

                        {/* Screen Share badge */}
                        {p.isSharingScreen && (
                          <span className="flex items-center gap-0.5 text-rose-300 font-medium">
                            <ScreenShare className="h-3 w-3" />
                            <span>Sharing</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Waiting for partner tile if only 1 participant */}
      {activeCount < 2 && !participants.some((p) => p.userId !== currentUserId && p.status === 'live') && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 p-3 min-w-[180px] sm:min-w-[220px]">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-dashed border-rose-400/40 text-rose-400 text-lg animate-pulse">
            💌
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-rose-200">Waiting for participants...</span>
            <span className="text-[10px] text-slate-400">Invite them to join with your link</span>
          </div>
        </div>
      )}
    </div>
  );
}
