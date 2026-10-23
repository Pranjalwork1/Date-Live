'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomTitle: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  roomTitle,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isDeleting ? undefined : onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-500/40 bg-[#140608]/95 p-6 sm:p-7 shadow-2xl text-center text-white backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 50px -10px rgba(239,68,68,0.35)',
          }}
        >
          {/* Header Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 shadow-lg shadow-red-500/30 mb-4 animate-pulse">
            <Trash2 className="h-7 w-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-300 text-xs font-semibold mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span>Permanent Action · Host Only</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Delete this room permanently?
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xs mx-auto">
            Delete this room permanently? All room members, messages, and saved room settings associated with <span className="text-white font-medium">&ldquo;{roomTitle}&rdquo;</span> will be removed. This action cannot be undone.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 py-3 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 py-3 text-xs font-semibold text-white shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Room</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
