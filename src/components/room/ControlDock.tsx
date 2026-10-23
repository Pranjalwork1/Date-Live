'use client';

import React from 'react';
import {
  Mic,
  MicOff,
  ScreenShare,
  MessageSquare,
  Volume2,
  VolumeX,
  PhoneOff,
  Tv,
} from 'lucide-react';
import AppleReactionPicker from './AppleReactionPicker';

interface ControlDockProps {
  isMuted: boolean;
  onToggleMic: () => void;
  isSharing: boolean;
  onToggleScreenShare: () => void;
  onSelectReaction: (emoji: string) => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  unreadCount?: number;
  isAmbienceActive: boolean;
  onToggleAmbience: () => void;
  isTheaterMode?: boolean;
  onToggleTheaterMode?: () => void;
  onLeaveRoom: () => void;
}

export default function ControlDock({
  isMuted,
  onToggleMic,
  isSharing,
  onToggleScreenShare,
  onSelectReaction,
  isChatOpen,
  onToggleChat,
  unreadCount = 0,
  isAmbienceActive,
  onToggleAmbience,
  isTheaterMode = false,
  onToggleTheaterMode,
  onLeaveRoom,
}: ControlDockProps) {
  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-black/85 px-4 py-2.5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 shadow-md cursor-pointer ${
            isMuted
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_15px_-3px_rgba(52,211,153,0.35)]'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Visually Prominent Share Screen Button */}
        <button
          onClick={onToggleScreenShare}
          className={`flex items-center gap-2 rounded-full px-4 sm:px-5 h-11 text-xs font-semibold transition-all active:scale-95 shadow-lg cursor-pointer ${
            isSharing
              ? 'bg-rose-600 text-white shadow-rose-600/30 hover:bg-rose-700 border border-rose-400'
              : 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white shadow-rose-500/25 border border-rose-400/40'
          }`}
          title={isSharing ? 'Stop Sharing Screen' : 'Share Screen & Movie Sound'}
          aria-label={isSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <ScreenShare className="h-4 w-4" />
          <span className="font-semibold">
            {isSharing ? 'Stop Sharing' : 'Share Screen'}
          </span>
        </button>

        {/* Apple-Style Reactions Picker */}
        <AppleReactionPicker onSelectReaction={onSelectReaction} />

        {/* Theater Mode Toggle */}
        {onToggleTheaterMode && (
          <button
            onClick={onToggleTheaterMode}
            className={`hidden md:flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 border cursor-pointer ${
              isTheaterMode
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
            aria-label="Toggle theater mode"
          >
            <Tv className="h-4 w-4" />
          </button>
        )}

        {/* Cozy Ambience Toggle */}
        <button
          onClick={onToggleAmbience}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 border cursor-pointer ${
            isAmbienceActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_-3px_rgba(245,158,11,0.35)]'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title={isAmbienceActive ? 'Mute Background Ambience' : 'Turn on Cozy Ambience (Rain soundscape)'}
          aria-label="Toggle background ambience"
        >
          {isAmbienceActive ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Chat Drawer Toggle */}
        <button
          onClick={onToggleChat}
          className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 border cursor-pointer ${
            isChatOpen
              ? 'bg-rose-500/25 text-rose-200 border-rose-500/50 shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title="Toggle Chat ('Little messages')"
          aria-label="Toggle chat panel"
        >
          <MessageSquare className="h-4 w-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Leave Room CTA */}
        <button
          onClick={onLeaveRoom}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/25 transition-all active:scale-95 shadow-md cursor-pointer"
          title="Leave Movie Night"
          aria-label="Leave room"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
