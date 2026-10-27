'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  X,
  Sparkles,
  Heart,
  Film,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  Share2,
  MessageCircle,
  Moon,
} from 'lucide-react';
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
  const [roomTitle, setRoomTitle] = useState('');
  const [theme, setTheme] = useState<ThemeType>('midnight');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state with invitation details
  const [createdRoom, setCreatedRoom] = useState<{
    code: string;
    title: string;
    url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter your name so your partner knows who invited them');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let hostUserId = '';
      if (typeof window !== 'undefined') {
        localStorage.setItem('moonlit_name', displayName.trim());
        hostUserId = localStorage.getItem('moonlit_user_id') || '';
        if (!hostUserId) {
          hostUserId = `usr_${Math.random().toString(36).substring(2, 10)}`;
          localStorage.setItem('moonlit_user_id', hostUserId);
        }
      }

      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: displayName.trim(),
          title: roomTitle.trim() || 'Our Movie Night',
          theme,
          hostUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create room');
      }

      const origin =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || 'https://moonlit.live';

      const inviteUrl = `${origin}/${data.room.room_code}`;
      setCreatedRoom({
        code: data.room.room_code,
        title: data.room.title || 'Our Movie Night',
        url: inviteUrl,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdRoom) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(createdRoom.url);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = createdRoom.url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      showToast('Invitation link copied to clipboard ❤️');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Failed to copy. Please select the link manually.');
    }
  };

  const handleWhatsAppShare = () => {
    if (!createdRoom) return;
    const message = `🌙 Hey! I saved us a little movie night ❤️\nJoin me on Moonlit — let's watch together 🍿🎬\n${createdRoom.url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (!createdRoom) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '🌙 Our Movie Night',
          text: "Join me for a movie night on Moonlit ❤️🍿",
          url: createdRoom.url,
        });
        showToast('Shared successfully ❤️');
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleEnterRoom = () => {
    if (!createdRoom) return;
    const targetCode = createdRoom.code;
    setCreatedRoom(null);
    setRoomTitle('');
    setError(null);
    onClose();
    router.push(`/${targetCode}`);
  };

  const handleModalClose = () => {
    setCreatedRoom(null);
    setRoomTitle('');
    setError(null);
    onClose();
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
          onClick={handleModalClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-60 rounded-full border border-rose-500/40 bg-black/90 px-4 py-2 text-xs font-semibold text-rose-200 shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-fade-in">
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-current animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-rose-500/25 bg-[#0d0f1f]/95 p-5 sm:p-6 shadow-2xl text-white backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 40px -10px rgba(244,63,94,0.3)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleModalClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
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
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
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

              {/* Small Room Preview Card */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm"
                    style={{ backgroundColor: THEMES[theme].dotColor }}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white truncate max-w-[190px]">
                      {roomTitle || 'Our Movie Night'}
                    </span>
                    <span className="text-[10px] text-slate-400">{THEMES[theme].name}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-medium">
                  Preview
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Preparing your room...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Create My Room</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Room Created — Production Ready Invitation Screen */
            <div className="flex flex-col gap-5 py-2">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white shadow-xl shadow-rose-500/35">
                  <Moon className="h-7 w-7 fill-current" />
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-xs uppercase tracking-widest text-rose-400 font-semibold">
                    {createdRoom.title}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Your movie night is ready 🌙
                  </h3>
                  <p className="text-xs text-slate-300/90 max-w-xs leading-relaxed">
                    Invite your person and start your little movie night together.
                  </p>
                </div>
              </div>

              {/* Read-Only Invitation URL Box */}
              <div className="flex flex-col gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between text-[10px] uppercase font-semibold tracking-wider text-rose-300">
                  <span>Private Invitation Link</span>
                  <span className="text-slate-400 font-normal">Click or copy</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdRoom.url}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-rose-100 select-all font-mono focus:outline-none focus:border-rose-500/60"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-rose-500/30 transition-all active:scale-95 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-white" />
                        <span>Copied ✓</span>
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

              {/* Action Buttons: WhatsApp & Native Share */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 fill-current" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-white shadow transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Enter Room CTA */}
              <button
                onClick={handleEnterRoom}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Enter Room</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

