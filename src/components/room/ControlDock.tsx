'use client';

import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  MessageSquare,
  Volume2,
  VolumeX,
  PhoneOff,
  Tv,
} from 'lucide-react';
import { ThemeType } from '@/lib/types';
import { THEMES, normalizeTheme } from '@/lib/themes';
import AppleReactionPicker from './AppleReactionPicker';

interface ControlDockProps {
  isMuted: boolean;
  onToggleMic: () => void;
  isCameraOn?: boolean;
  onToggleCamera?: () => void;
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
  theme?: ThemeType;
}

export default function ControlDock({
  isMuted,
  onToggleMic,
  isCameraOn = false,
  onToggleCamera,
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
  theme = 'midnight',
}: ControlDockProps) {
  const activeTheme = THEMES[normalizeTheme(theme)] || THEMES.midnight;

  return (
    <div
      className={`fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-5 left-0 z-40 justify-center px-2 sm:px-4 pointer-events-none transition-all duration-300 ${
        isChatOpen ? 'hidden sm:flex sm:right-80 md:right-96' : 'flex right-0'
      }`}
    >
      <div
        className="pointer-events-auto flex items-end gap-1 sm:gap-2 md:gap-3 rounded-full border px-2.5 sm:px-4 py-1.5 sm:py-2.5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar transition-all duration-500"
        style={{
          backgroundColor: activeTheme.cardBg,
          borderColor: activeTheme.cardBorder,
          boxShadow: `0 20px 50px -10px rgba(0,0,0,0.9), 0 0 30px -5px ${activeTheme.glowColor}`,
        }}
      >
        {/* Microphone Toggle */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={onToggleMic}
            className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all active:scale-95 shadow-md cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_15px_-3px_rgba(52,211,153,0.4)]'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
          <span className={`text-[9px] font-medium sm:hidden ${isMuted ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isMuted ? 'Muted' : 'Mic'}
          </span>
        </div>

        {/* Camera Toggle */}
        {onToggleCamera && (
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={onToggleCamera}
              className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all active:scale-95 shadow-md cursor-pointer ${
                !isCameraOn
                  ? 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_15px_-3px_rgba(52,211,153,0.4)]'
              }`}
              title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              aria-label={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCameraOn ? <Video className="h-4 w-4 sm:h-5 sm:w-5" /> : <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            <span className={`text-[9px] font-medium sm:hidden ${isCameraOn ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isCameraOn ? 'Cam' : 'Cam'}
            </span>
          </div>
        )}

        {/* Visually Prominent Share Screen Button */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={onToggleScreenShare}
            className={`flex items-center gap-1.5 rounded-full px-3 sm:px-5 h-10 sm:h-11 text-xs font-semibold transition-all active:scale-95 shadow-lg cursor-pointer ${
              isSharing
                ? 'bg-rose-600 text-white shadow-rose-600/30 hover:bg-rose-700 border border-rose-400'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white shadow-rose-500/30 border border-rose-400/40'
            }`}
            title={isSharing ? 'Stop Sharing Screen' : 'Share Screen & Movie Sound'}
            aria-label={isSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            <ScreenShare className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline font-semibold">
              {isSharing ? 'Stop Sharing' : 'Share Screen'}
            </span>
          </button>
          <span className="text-[9px] font-medium sm:hidden text-rose-300">
            {isSharing ? 'Stop' : 'Share'}
          </span>
        </div>

        {/* Apple-Style Reactions Picker */}
        <div className="flex flex-col items-center gap-0.5">
          <AppleReactionPicker onSelectReaction={onSelectReaction} />
          <span className="text-[9px] font-medium sm:hidden text-slate-400">React</span>
        </div>

        {/* Theater Mode Toggle — desktop only */}
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

        {/* Cozy Ambience Toggle — hidden on mobile to save space */}
        <div className="hidden sm:flex flex-col items-center gap-0.5">
          <button
            onClick={onToggleAmbience}
            className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all active:scale-95 border cursor-pointer ${
              isAmbienceActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_-3px_rgba(245,158,11,0.35)]'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title={isAmbienceActive ? 'Mute Background Ambience' : 'Turn on Cozy Ambience (Rain soundscape)'}
            aria-label="Toggle background ambience"
          >
            {isAmbienceActive ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>

        {/* Chat Drawer Toggle */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={onToggleChat}
            className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all active:scale-95 border cursor-pointer ${
              isChatOpen
                ? 'bg-rose-500/25 text-rose-200 border-rose-500/50 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title="Toggle Chat"
            aria-label="Toggle chat panel"
          >
            <MessageSquare className="h-4 w-4" />
            {unreadCount > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
          <span className="text-[9px] font-medium sm:hidden text-slate-400">Chat</span>
        </div>

        {/* Leave Room CTA */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={onLeaveRoom}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/25 transition-all active:scale-95 shadow-md cursor-pointer"
            title="Leave Movie Night"
            aria-label="Leave room"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
          <span className="text-[9px] font-medium sm:hidden text-rose-400">Leave</span>
        </div>
      </div>
    </div>
  );
}
