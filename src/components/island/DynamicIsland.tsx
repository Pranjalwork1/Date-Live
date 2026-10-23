'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Sparkles,
  Copy,
  Check,
  LogOut,
  Palette,
  Volume2,
  ChevronDown,
  Film,
  Heart,
  LogIn,
} from 'lucide-react';
import { ThemeType } from '@/lib/types';
import { THEMES } from '@/lib/themes';

interface DynamicIslandProps {
  mode: 'landing' | 'room';
  roomCode?: string;
  roomTitle?: string;
  theme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
  participantCount?: number;
  isConnected?: boolean;
  onOpenCreate?: () => void;
  onOpenJoin?: () => void;
  onLeaveRoom?: () => void;
  onToggleAmbience?: () => void;
  isAmbienceActive?: boolean;
}

export default function DynamicIsland({
  mode,
  roomCode,
  roomTitle = 'Our Movie Night',
  theme = 'midnight',
  onThemeChange,
  participantCount = 1,
  isConnected = true,
  onOpenCreate,
  onOpenJoin,
  onLeaveRoom,
  onToggleAmbience,
  isAmbienceActive = false,
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const islandRef = useRef<HTMLDivElement>(null);

  // Timer for active in-room session
  useEffect(() => {
    if (mode !== 'room' || !isConnected) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, isConnected]);

  // Click outside listener for expanded island
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    }
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyInviteLink = () => {
    if (!roomCode || typeof window === 'undefined') return;
    const url = `${window.location.origin}/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.div
        ref={islandRef}
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        className={`pointer-events-auto relative overflow-hidden border border-white/15 bg-black/80 backdrop-blur-2xl transition-all duration-300 ${
          isExpanded
            ? 'rounded-3xl border-rose-500/35 ring-1 ring-rose-500/20 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85),0_0_35px_-5px_rgba(244,63,94,0.3)]'
            : 'rounded-full hover:border-rose-500/30 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.7),0_0_20px_-4px_rgba(244,63,94,0.18)]'
        }`}
      >
        {/* LANDING PAGE ISLAND */}
        {mode === 'landing' ? (
          <div className="flex flex-col">
            {/* Main Capsule Header */}
            <div className="flex items-center gap-3 px-3.5 py-2 sm:gap-5 sm:px-5 sm:py-2.5">
              {/* Logo & Click-to-Expand Trigger */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-left focus:outline-none group"
                aria-label="Toggle navigation menu"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white shadow-md shadow-rose-500/30 group-hover:scale-105 transition-transform">
                  <Moon className="h-3.5 w-3.5 fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold tracking-tight text-white text-xs sm:text-sm">
                    Moonlit
                  </span>
                </div>
              </button>

              {/* Status Pill */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 px-3 py-1 text-xs text-rose-200/90 font-light border border-white/5 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-rose-400 animate-pulse" />
                <span>Your next movie date awaits</span>
                <ChevronDown
                  className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-rose-400' : ''
                  }`}
                />
              </button>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenJoin}
                  className="hidden sm:inline-flex px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                  Join
                </button>
                <button
                  onClick={onOpenCreate}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 active:scale-95 transition-all"
                >
                  <Heart className="h-3 w-3 fill-current text-white" />
                  <span>Create Room</span>
                </button>
              </div>
            </div>

            {/* Expanded Landing Menu */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="px-5 pb-4 pt-2 border-t border-white/10 flex flex-col gap-3 min-w-[290px] sm:min-w-[360px]"
                >
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A private romantic space for two. Watch in sync, talk naturally, and share reactions.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        setIsExpanded(false);
                        onOpenCreate?.();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 font-medium transition-all"
                    >
                      <Film className="h-4 w-4 text-rose-400" />
                      <span>Start Date Room</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsExpanded(false);
                        onOpenJoin?.();
                      }}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-medium transition-all"
                    >
                      <LogIn className="h-4 w-4 text-purple-400" />
                      <span>Join with Link</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-300" /> Real-time screen & tab audio
                    </span>
                    <span className="text-rose-300">Made for two</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* IN-ROOM LIVE SESSION ISLAND */
          <div className="flex flex-col">
            {/* Collapsed Capsule Bar */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-3 px-4 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 rounded-full cursor-pointer"
              aria-expanded={isExpanded}
              aria-label="Toggle movie session controls"
            >
              {/* Connection Indicator Dot */}
              <div className="relative flex items-center justify-center">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-400 shadow-[0_0_8px_#fb7185]'
                  }`}
                />
                {isConnected && (
                  <span className="absolute h-4 w-4 rounded-full bg-emerald-400/30 animate-ping" />
                )}
              </div>

              {/* Status & Title */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white tracking-tight line-clamp-1 max-w-[110px] sm:max-w-[160px]">
                    {roomTitle}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                    {participantCount >= 2 ? 'Together now ❤️' : 'Solo 🍿'}
                  </span>
                </div>
              </div>

              {/* Session Timer */}
              <div className="hidden xs:flex items-center gap-1 text-xs font-mono text-slate-300 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>

              {/* Overlapping Two-Person Avatar Stack */}
              <div className="flex -space-x-2 items-center pl-1">
                <div
                  className="h-6 w-6 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 border-2 border-black flex items-center justify-center text-[10px] text-white font-bold shadow-sm"
                  title="You"
                >
                  Y
                </div>
                <div
                  className={`h-6 w-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] text-white font-bold shadow-sm ${
                    participantCount >= 2
                      ? 'bg-gradient-to-tr from-purple-500 to-indigo-500'
                      : 'bg-white/10 text-slate-400 border-dashed'
                  }`}
                  title={participantCount >= 2 ? 'Partner' : 'Waiting for partner'}
                >
                  {participantCount >= 2 ? 'P' : '💌'}
                </div>
              </div>

              {/* Expand Caret */}
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180 text-rose-400' : ''
                }`}
              />
            </button>

            {/* Expanded Session Details Drawer */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="px-5 pb-4 pt-2 border-t border-white/10 flex flex-col gap-3.5 min-w-[290px] sm:min-w-[360px]"
                >
                  {/* Room Code & Copy */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Invite Code</span>
                      <span className="text-xs font-mono text-rose-300 font-semibold">{roomCode}</span>
                    </div>
                    <button
                      onClick={copyInviteLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Theme Switcher */}
                  {onThemeChange && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Palette className="h-3.5 w-3.5 text-rose-400" /> Room Mood
                        </span>
                        <span className="text-rose-300 text-[11px] font-semibold">{THEMES[theme].name}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(Object.keys(THEMES) as ThemeType[]).map((tKey) => {
                          const t = THEMES[tKey];
                          const isActive = theme === tKey;
                          return (
                            <button
                              key={tKey}
                              onClick={() => onThemeChange(tKey)}
                              className={`p-1.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                isActive
                                  ? 'border-rose-400/80 bg-rose-500/25 shadow-sm shadow-rose-500/20'
                                  : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-400'
                              }`}
                            >
                              <div
                                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: t.dotColor }}
                              />
                              <span className="text-[10px] text-white/90 truncate max-w-full font-medium">
                                {t.name.split(' ')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ambience & Info Toggles */}
                  <div className="flex items-center justify-between pt-1 text-xs border-t border-white/5">
                    {onToggleAmbience && (
                      <button
                        onClick={onToggleAmbience}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors text-xs font-medium cursor-pointer ${
                          isAmbienceActive
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                        }`}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>{isAmbienceActive ? 'Ambience: On' : 'Ambience: Off'}</span>
                      </button>
                    )}

                    {onLeaveRoom && (
                      <button
                        onClick={onLeaveRoom}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors text-xs font-medium cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Leave Room</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </header>
  );
}
