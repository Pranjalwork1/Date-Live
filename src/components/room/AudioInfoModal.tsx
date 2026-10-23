'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AudioInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AudioInfoModal({ isOpen, onClose }: AudioInfoModalProps) {
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f1f]/95 p-6 shadow-2xl text-white backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 35px -5px rgba(244,63,94,0.25)',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
                <Volume2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-white tracking-tight">Movie Audio Guide</h3>
                <span className="text-xs text-rose-300">How to share sound with your movie</span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-slate-200 leading-relaxed">
              <strong className="text-rose-300 font-semibold block mb-1">
                The Golden Rule for Movie Sound:
              </strong>
              When the browser sharing window appears, choose the <strong>Chrome/Edge Tab</strong> where your movie is playing, and make sure the checkbox{' '}
              <span className="text-white font-semibold underline decoration-rose-400">&quot;Also share tab audio&quot;</span> is turned ON.
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Supported Browsers:</strong> Chromium-based browsers (Google Chrome, Microsoft Edge, Brave) provide full system and tab audio sharing.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Independent Voice:</strong> Your microphone and the shared movie sound are handled on separate audio channels, so you can talk or laugh together without interrupting movie audio.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">DRM Notice (Netflix / Disney+ / Prime):</strong> Certain commercial streaming services restrict browser screen capture with hardware DRM (causing video to appear black or silent). For the smoothest experience, watch via supported web players, YouTube, Vimeo, personal videos, or browser windows with hardware acceleration disabled if permitted.
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-xs font-semibold text-white transition-all active:scale-[0.98]"
            >
              Got it, let&apos;s watch!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
