'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { REACTION_EMOJIS } from '@/lib/themes';

interface AppleReactionPickerProps {
  onSelectReaction: (emoji: string) => void;
  disabled?: boolean;
}

export default function AppleReactionPicker({
  onSelectReaction,
  disabled = false,
}: AppleReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePick = (emoji: string) => {
    onSelectReaction(emoji);
    // Keep brief open or close
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Floating Reactions Bar Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full border border-white/20 bg-black/90 px-2 sm:px-3 py-1.5 sm:py-2 shadow-2xl backdrop-blur-2xl whitespace-nowrap"
            style={{
              boxShadow:
                '0 15px 40px -10px rgba(0, 0, 0, 0.7), 0 0 25px -5px rgba(244, 63, 94, 0.4)',
            }}
          >
            {REACTION_EMOJIS.map((item, idx) => (
              <motion.button
                key={item.emoji}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.025, type: 'spring', stiffness: 600, damping: 25 }}
                whileHover={{ scale: 1.35, y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePick(item.emoji)}
                title={`${item.label} (${item.desc})`}
                aria-label={`Send ${item.label} reaction`}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-lg sm:text-xl transition-all hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                <span>{item.emoji}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`group relative flex items-center justify-center gap-2 rounded-full border h-10 w-10 sm:h-11 sm:w-auto sm:px-4 text-xs font-semibold text-white shadow-xl backdrop-blur-xl transition-all cursor-pointer ${
          isOpen
            ? 'border-rose-400 bg-rose-500/30 text-rose-200 ring-2 ring-rose-400/30'
            : 'border-white/15 bg-black/60 hover:border-rose-500/40 hover:bg-rose-500/20'
        }`}
        style={{
          boxShadow: '0 8px 25px -5px rgba(0,0,0,0.5), 0 0 20px -3px rgba(244, 63, 94, 0.25)',
        }}
        aria-label="Send romantic reaction"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <Heart className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-rose-400 fill-rose-500/40 group-hover:fill-rose-500 transition-colors" />
          <Sparkles className="absolute -top-1 -right-1.5 h-2.5 w-2.5 text-amber-300 animate-pulse" />
        </div>
        <span className="hidden sm:inline">React</span>
      </motion.button>
    </div>
  );
}
