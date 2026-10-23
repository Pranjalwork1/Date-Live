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
  onLeaveRoom,
}: ControlDockProps) {
  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-black/80 px-4 py-2.5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 shadow-md ${
            isMuted
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_15px_-3px_rgba(52,211,153,0.3)]'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`flex items-center gap-2 rounded-full px-4 h-11 text-xs font-semibold transition-all active:scale-95 shadow-md ${
            isSharing
              ? 'bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600 border border-rose-400'
              : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
          }`}
          title={isSharing ? 'Stop Sharing Screen' : 'Share Screen & Movie Sound'}
          aria-label={isSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <ScreenShare className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isSharing ? 'Stop Sharing' : 'Share Screen'}
          </span>
        </button>

        {/* Apple-Style Reactions Picker */}
        <AppleReactionPicker onSelectReaction={onSelectReaction} />

        {/* Cozy Ambience Toggle */}
        <button
          onClick={onToggleAmbience}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 border ${
            isAmbienceActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title={isAmbienceActive ? 'Mute Ambience' : 'Turn on Cozy Ambience'}
          aria-label="Toggle background ambience"
        >
          {isAmbienceActive ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Chat Drawer Toggle */}
        <button
          onClick={onToggleChat}
          className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 border ${
            isChatOpen
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title="Toggle Chat"
          aria-label="Toggle chat panel"
        >
          <MessageSquare className="h-4 w-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Leave Room CTA */}
        <button
          onClick={onLeaveRoom}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all active:scale-95 shadow-md"
          title="Leave Movie Night"
          aria-label="Leave room"
        >
          <PhoneOff className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
