'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Heart, ArrowLeft } from 'lucide-react';

interface LeaveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomTitle: string;
}

export default function LeaveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  roomTitle,
}: LeaveConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-[#0d0f1f]/95 p-6 sm:p-7 shadow-2xl text-center text-white backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 45px -10px rgba(244,63,94,0.25)',
          }}
        >
          {/* Header Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 shadow-lg shadow-rose-500/20 mb-4">
            <LogOut className="h-7 w-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold mb-2">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>Movie Date Session</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Leave this room?
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xs mx-auto">
            Are you sure you want to leave <span className="text-white font-medium">&ldquo;{roomTitle}&rdquo;</span>? You can rejoin anytime using the room link, and other participants will not be disconnected.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 py-3 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Stay in Room</span>
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 py-3 text-xs font-semibold text-white shadow-lg shadow-rose-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Yes, Leave Room</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
