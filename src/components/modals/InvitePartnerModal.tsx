'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Shield,
  Sparkles,
} from 'lucide-react';

interface InvitePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  roomTitle: string;
}

export default function InvitePartnerModal({
  isOpen,
  onClose,
  roomCode,
  roomTitle,
}: InvitePartnerModalProps) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'https://moonlit.live';

  const inviteUrl = `${origin}/${roomCode}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = inviteUrl;
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
    const message = `🌙 Hey! I saved us a little movie night ❤️\nJoin me on Moonlit — let's watch together 🍿🎬\n${inviteUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `🌙 ${roomTitle}`,
          text: 'Join me for a movie night on Moonlit ❤️🍿',
          url: inviteUrl,
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
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/25 bg-[#0d0f1f]/95 p-6 shadow-2xl text-white backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 40px -10px rgba(244,63,94,0.3)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30">
              <Heart className="h-6 w-6 fill-current animate-pulse" />
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              <div className="inline-flex items-center justify-center gap-1.5 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                <span>{roomTitle}</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Invite your person ❤️
              </h3>
              <p className="text-xs text-slate-300/90 max-w-xs leading-relaxed">
                Send this private invitation link so they can join your movie date with one click.
              </p>
            </div>
          </div>

          {/* Invitation URL Box */}
          <div className="flex flex-col gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 backdrop-blur-md mb-4">
            <div className="flex items-center justify-between text-[10px] uppercase font-semibold tracking-wider text-rose-300">
              <span>Private Room Link</span>
              <span className="font-mono text-[11px] text-slate-400">{roomCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
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
          <div className="grid grid-cols-2 gap-2.5 mb-4">
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

          {/* Security Notice */}
          <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-3 text-[11px] text-slate-300">
            <Shield className="h-4 w-4 text-rose-400 shrink-0" />
            <span>Anyone with this private invitation link can join this movie room.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
