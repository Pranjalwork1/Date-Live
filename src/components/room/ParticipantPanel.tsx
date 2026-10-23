'use client';

import React from 'react';
import { Mic, MicOff, Crown, ScreenShare } from 'lucide-react';

export interface ParticipantState {
  userId: string;
  displayName: string;
  isHost: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isSharingScreen: boolean;
  isCameraOn: boolean;
  cameraStream?: MediaStream | null;
}

interface ParticipantPanelProps {
  participants: ParticipantState[];
  currentUserId: string;
}

export default function ParticipantPanel({
  participants,
  currentUserId,
}: ParticipantPanelProps) {
  return (
    <div className="flex flex-row lg:flex-col gap-3 shrink-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
      {participants.map((p) => {
        const isSelf = p.userId === currentUserId;
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
              p.isSpeaking
                ? 'border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]'
                : 'border-white/10 bg-black/40 backdrop-blur-xl'
            } min-w-[170px] sm:min-w-[200px]`}
          >
            {/* Avatar with speaking wave */}
            <div className="relative">
              <div
                className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full text-sm sm:text-base font-bold text-white shadow-md transition-all ${
                  p.isHost
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

              {/* Pulsing Speaking Halo */}
              {p.isSpeaking && (
                <span className="absolute -inset-1 rounded-full border-2 border-emerald-400/80 animate-ping pointer-events-none" />
              )}
            </div>

            {/* Info & Status */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-white truncate">
                  {p.displayName} {isSelf && <span className="text-slate-400 font-normal">(You)</span>}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
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
              </div>
            </div>
          </div>
        );
      })}

      {/* Waiting for partner tile if alone */}
      {participants.length < 2 && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 p-2.5 sm:p-3 min-w-[170px] sm:min-w-[200px]">
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
