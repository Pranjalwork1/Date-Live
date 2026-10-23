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
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`pointer-events-auto relative overflow-hidden rounded-full border border-white/15 bg-black/75 shadow-2xl backdrop-blur-2xl transition-colors duration-300 ${
          isExpanded ? 'rounded-3xl border-rose-500/30 ring-1 ring-rose-500/20' : ''
        }`}
        style={{
          boxShadow: isExpanded
            ? '0 20px 45px -10px rgba(0, 0, 0, 0.8), 0 0 35px -5px rgba(244, 63, 94, 0.25)'
            : '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 15px -3px rgba(244, 63, 94, 0.15)',
        }}
      >
        {/* LANDING PAGE ISLAND */}
        {mode === 'landing' ? (
          <div className="flex items-center gap-3 px-4 py-2 sm:gap-6 sm:px-6 sm:py-2.5">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-purple-500 text-white shadow-md shadow-rose-500/20">
                <Moon className="h-3.5 w-3.5 fill-current" />
              </div>
              <span className="font-medium tracking-tight text-white text-sm sm:text-base">
                Moonlit
              </span>
            </div>

            {/* Subtle Status Pill */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-rose-200/90 font-light">
              <Sparkles className="h-3 w-3 text-rose-400 animate-pulse" />
              <span>Ready for movie night?</span>
            </div>

            {/* Navigation / Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenJoin}
                className="hidden sm:inline-flex px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                Join with link
              </button>
              <button
                onClick={onOpenCreate}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-md shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 active:scale-95 transition-all"
              >
                <span>Create Room</span>
              </button>
            </div>
          </div>
        ) : (
          /* IN-ROOM LIVE SESSION ISLAND */
          <div className="flex flex-col">
            {/* Collapsed Capsule Bar */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-3 px-4 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 rounded-full"
              aria-expanded={isExpanded}
              aria-label="Toggle movie session controls"
            >
              {/* Connection Indicator Dot */}
              <div className="relative flex items-center justify-center">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
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
                    {participantCount === 2 ? 'Together ❤️' : 'Solo 🍿'}
                  </span>
                </div>
              </div>

              {/* Session Timer */}
              <div className="hidden xs:flex items-center gap-1 text-xs font-mono text-slate-300 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>

              {/* Participant mini avatar stack */}
              <div className="flex -space-x-1.5 items-center">
                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 border border-black flex items-center justify-center text-[10px] text-white font-medium">
                  Y
                </div>
                {participantCount >= 2 && (
                  <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border border-black flex items-center justify-center text-[10px] text-white font-medium">
                    P
                  </div>
                )}
              </div>

              {/* Expand caret */}
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
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-4 pt-2 border-t border-white/10 flex flex-col gap-3 min-w-[280px] sm:min-w-[340px]"
                >
                  {/* Room Code & Copy */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">Invite Code</span>
                      <span className="text-xs font-mono text-rose-300 font-medium">{roomCode}</span>
                    </div>
                    <button
                      onClick={copyInviteLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
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
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Palette className="h-3 w-3 text-rose-400" /> Room Mood
                        </span>
                        <span className="text-rose-300 text-[11px] font-medium">{THEMES[theme].name}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(Object.keys(THEMES) as ThemeType[]).map((tKey) => {
                          const t = THEMES[tKey];
                          const isActive = theme === tKey;
                          return (
                            <button
                              key={tKey}
                              onClick={() => onThemeChange(tKey)}
                              className={`p-1.5 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                                isActive
                                  ? 'border-rose-400/80 bg-rose-500/20 shadow-sm'
                                  : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-400'
                              }`}
                            >
                              <div
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: t.dotColor }}
                              />
                              <span className="text-[10px] text-white/90 truncate max-w-full">
                                {t.name.split(' ')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ambience & Info Toggles */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    {onToggleAmbience && (
                      <button
                        onClick={onToggleAmbience}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs ${
                          isAmbienceActive
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>{isAmbienceActive ? 'Ambience: On' : 'Ambience: Off'}</span>
                      </button>
                    )}

                    {onLeaveRoom && (
                      <button
                        onClick={onLeaveRoom}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-xs"
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
