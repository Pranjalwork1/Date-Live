'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Moon, Heart, Home, RotateCcw } from 'lucide-react';

interface LeaveSummaryModalProps {
  isOpen: boolean;
  roomTitle: string;
  durationFormatted: string;
  onRejoin: () => void;
}

export default function LeaveSummaryModal({
  isOpen,
  roomTitle,
  durationFormatted,
  onRejoin,
}: LeaveSummaryModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/20 bg-[#0d0f1f]/95 p-7 shadow-2xl text-center text-white backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 50px -10px rgba(244,63,94,0.3)',
          }}
        >
          {/* Animated Moon Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-xl shadow-rose-500/30 mb-4">
            <Moon className="h-8 w-8 fill-current text-white animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold mb-2">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>Movie Date Complete</span>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
            What a lovely movie date 🌙
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed mb-6 max-w-xs mx-auto">
            Thank you for spending this sweet moment together. Even when miles apart, love is in the shared laughter.
          </p>

          {/* Session Summary Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-6 flex items-center justify-around">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Room</span>
              <span className="text-xs font-semibold text-white truncate max-w-[140px]">{roomTitle}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Shared Time</span>
              <span className="text-xs font-mono font-bold text-rose-300">{durationFormatted}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 py-3 text-xs font-semibold text-white transition-all active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>Back Home</span>
            </button>
            <button
              onClick={onRejoin}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-xs font-semibold text-white shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 transition-all active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Rejoin Room</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
