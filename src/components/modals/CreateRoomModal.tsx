'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, Sparkles, Heart, Film, Copy, Check, ArrowRight, Loader2 } from 'lucide-react';
import { ThemeType } from '@/lib/types';
import { THEMES } from '@/lib/themes';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('moonlit_name') || '';
    }
    return '';
  });
  const [roomTitle, setRoomTitle] = useState('Our Movie Night');
  const [theme, setTheme] = useState<ThemeType>('midnight');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state with copyable link
  const [createdRoom, setCreatedRoom] = useState<{
    code: string;
    url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your name so your partner knows who invited them');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('moonlit_name', displayName.trim());
      }

      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: displayName.trim(),
          title: roomTitle.trim() || 'Our Movie Night',
          theme,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create room');
      }

      const inviteUrl = `${window.location.origin}/${data.room.room_code}`;
      setCreatedRoom({
        code: data.room.room_code,
        url: inviteUrl,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdRoom) return;
    navigator.clipboard.writeText(createdRoom.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEnterRoom = () => {
    if (!createdRoom) return;
    router.push(`/${createdRoom.code}`);
  };

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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/20 bg-[#0d0f1f]/95 p-6 shadow-2xl text-white backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 40px -10px rgba(244,63,94,0.3)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {!createdRoom ? (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  <span>Private Date Room</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Create Your Movie Night
                </h3>
                <p className="text-xs text-slate-400">
                  Set up a cozy room for two. You can share your screen, movie sound, and talk freely.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {error}
                </div>
              )}

              {/* Display Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Your Name</label>
                <input
                  type="text"
                  required
                  maxLength={40}
                  placeholder="e.g. Alex"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-500/60 focus:bg-white/10 focus:outline-none transition-all"
                />
              </div>

              {/* Room Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Room Title</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="Our Movie Night"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-rose-500/60 focus:bg-white/10 focus:outline-none transition-all pr-8"
                  />
                  <Film className="absolute right-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Mood / Theme Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-300">Choose a Romantic Mood</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(THEMES) as ThemeType[]).map((tKey) => {
                    const t = THEMES[tKey];
                    const isSelected = theme === tKey;
                    return (
                      <button
                        type="button"
                        key={tKey}
                        onClick={() => setTheme(tKey)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-rose-500/70 bg-rose-500/15 shadow-sm shadow-rose-500/20'
                            : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-400'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: t.dotColor }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-white truncate">{t.name}</span>
                          <span className="text-[10px] text-slate-400 truncate">{t.tagline.split(',')[0]}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Preparing your room...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Create Date Room</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Room Created — Share Link Screen */
            <div className="flex flex-col gap-5 py-2">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-purple-500 text-white shadow-xl shadow-rose-500/30">
                  <Heart className="h-7 w-7 fill-current animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Your Room is Ready!</h3>
                <p className="text-xs text-slate-300 max-w-xs">
                  Copy the invitation link below and send it to your partner. They can join with a single click.
                </p>
              </div>

              {/* Link Box */}
              <div className="flex flex-col gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-rose-300">
                  Shareable Invitation Link
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdRoom.url}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 select-all font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 px-3 py-1.5 text-xs font-semibold text-white shadow transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Enter Room CTA */}
              <button
                onClick={handleEnterRoom}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 hover:opacity-95 active:scale-[0.98] transition-all"
              >
                <span>Enter Room Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
