'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, LogIn, Loader2, KeyRound } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export default function JoinRoomModal({
  isOpen,
  onClose,
  initialCode = '',
}: JoinRoomModalProps) {
  const router = useRouter();
  const [codeOrUrl, setCodeOrUrl] = useState(initialCode);
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('moonlit_name') || '';
    }
    return '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeOrUrl.trim()) {
      setError('Please enter a room code or invite link');
      return;
    }
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    // Extract code if user pasted a full URL
    let cleanCode = codeOrUrl.trim();
    if (cleanCode.includes('/')) {
      const parts = cleanCode.split('/');
      cleanCode = parts[parts.length - 1].split('?')[0];
    }
    cleanCode = cleanCode.toLowerCase().trim();

    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('moonlit_name', displayName.trim());
      }

      // Validate room exists before routing
      const res = await fetch(`/api/room/${cleanCode}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Room invitation is invalid or expired');
      }

      // Navigate to room
      router.push(`/${cleanCode}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f1f]/95 p-6 shadow-2xl text-white backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 40px -10px rgba(168,85,247,0.25)',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <form onSubmit={handleJoin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
                <KeyRound className="h-3.5 w-3.5" />
                <span>Join a Movie Date</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Enter an Invitation
              </h3>
              <p className="text-xs text-slate-400">
                Paste the invitation link or room code you received to join your special someone.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Room code or Link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Room Code or Invite Link</label>
              <input
                type="text"
                required
                placeholder="moon-xxxx-xxxx or https://..."
                value={codeOrUrl}
                onChange={(e) => setCodeOrUrl(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500/60 focus:bg-white/10 focus:outline-none transition-all font-mono"
              />
            </div>

            {/* Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Your Display Name</label>
              <input
                type="text"
                required
                maxLength={40}
                placeholder="e.g. Maya"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500/60 focus:bg-white/10 focus:outline-none transition-all"
              />
            </div>

            {/* Join CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-purple-400 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to room...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Join Movie Date</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
