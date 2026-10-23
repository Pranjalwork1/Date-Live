'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { HeartCrack, Home } from 'lucide-react';

interface RoomDeletedNoticeModalProps {
  isOpen: boolean;
}

export default function RoomDeletedNoticeModal({ isOpen }: RoomDeletedNoticeModalProps) {
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
          className="fixed inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-[#0d0f1f]/95 p-7 shadow-2xl text-center text-white backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 50px -10px rgba(244,63,94,0.3)',
          }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-xl shadow-rose-500/25 mb-4">
            <HeartCrack className="h-8 w-8" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            This movie room has ended 🌙
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xs mx-auto">
            The room host has closed and permanently deleted this room. All session details have been safely cleared.
          </p>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 py-3 text-xs font-semibold text-white shadow-lg shadow-rose-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
