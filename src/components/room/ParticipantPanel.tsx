'use client';

import React from 'react';
import { Mic, MicOff, Crown, ScreenShare } from 'lucide-react';
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

export default function ParticipantPanel({
  participants,
  currentUserId,
  theme = 'midnight',
}: ParticipantPanelProps) {
  const activeTheme = THEMES[normalizeTheme(theme)] || THEMES.midnight;
  const activeCount = participants.filter((p) => p.status === 'live').length;

  return (
    <div className="flex flex-row lg:flex-col gap-3 shrink-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
      {participants.map((p) => {
        const isSelf = p.userId === currentUserId;
        const isLive = p.status === 'live';
        const isReconnecting = p.status === 'reconnecting';
        const isOffline = p.status === 'offline';

        const initials = (p.displayName || 'Guest')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div
            key={p.userId}
            className={`relative flex items-center gap-3 rounded-2xl border p-2.5 sm:p-3 transition-all ${
              isLive && p.isSpeaking
                ? 'border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]'
                : isOffline
                ? 'border-white/5 bg-black/20 opacity-60 backdrop-blur-md'
                : isReconnecting
                ? 'border-amber-500/40 bg-amber-500/5 backdrop-blur-xl'
                : 'backdrop-blur-xl shadow-lg'
            } min-w-[170px] sm:min-w-[210px]`}
            style={
              !isOffline && !isReconnecting && !(isLive && p.isSpeaking)
                ? {
                    backgroundColor: activeTheme.cardBg,
                    borderColor: activeTheme.cardBorder,
                  }
                : undefined
            }
          >
            {/* Avatar with speaking wave */}
            <div className="relative">
              <div
                className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full text-sm sm:text-base font-bold text-white shadow-md transition-all ${
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
                <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[100px] sm:max-w-[120px]">
                  {p.displayName} {isSelf && <span className="text-slate-400 font-normal">(You)</span>}
                </span>

                {/* Presence Status Badges */}
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
                    <span>Left the room</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                {isOffline ? (
                  <span className="text-[10px] text-slate-400">Currently offline</span>
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
        );
      })}

      {/* Waiting for partner tile if no other participant has ever joined */}
      {activeCount < 2 && !participants.some((p) => p.userId !== currentUserId) && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 p-2.5 sm:p-3 min-w-[170px] sm:min-w-[210px]">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-dashed border-rose-400/40 text-rose-400 text-lg animate-pulse">
            💌
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-rose-200">Waiting for partner...</span>
            <span className="text-[10px] text-slate-400">Send them the invite link</span>
          </div>
        </div>
      )}
    </div>
  );
}
