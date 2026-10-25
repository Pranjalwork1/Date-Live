'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, LogIn, Loader2, KeyRound, RefreshCw, Sparkles, ArrowLeft } from 'lucide-react';

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

  // Duplicate name resolution state
  const [nameConflict, setNameConflict] = useState<{
    originalName: string;
    suggestions: string[];
    cleanCode: string;
  } | null>(null);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  const cleanExtractedCode = (input: string) => {
    let clean = input.trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      clean = parts[parts.length - 1].split('?')[0];
    }
    return clean.toLowerCase().trim();
  };

  const executeJoinWithName = async (code: string, finalName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('moonlit_name', finalName);
        sessionStorage.setItem(`moonlit_name_${code}`, finalName);
      }

      // Check room and attempt join
      const sessionKey = `moonlit_session_user_${code}`;
      const userId = typeof window !== 'undefined' ? sessionStorage.getItem(sessionKey) : null;

      const joinRes = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: code,
          displayName: finalName,
          userId,
        }),
      });

      const joinData = await joinRes.json();

      if (joinRes.status === 409 || joinData.nameTaken) {
        setNameConflict({
          originalName: joinData.originalName || finalName,
          suggestions: joinData.suggestions || [],
          cleanCode: code,
        });
        setIsLoading(false);
        return;
      }

      if (!joinRes.ok || joinData.error) {
        throw new Error(joinData.error || 'Failed to join room');
      }

      if (joinData.member?.user_id && typeof window !== 'undefined') {
        sessionStorage.setItem(sessionKey, joinData.member.user_id);
      }

      // Successful join -> Navigate
      router.push(`/${code}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setIsLoading(false);
    }
  };

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

    const cleanCode = cleanExtractedCode(codeOrUrl);
    await executeJoinWithName(cleanCode, displayName.trim());
  };

  const handleGenerateMoreOptions = async () => {
    if (!nameConflict) return;
    setIsGeneratingMore(true);
    try {
      const res = await fetch(
        `/api/room/name-options?roomCode=${encodeURIComponent(
          nameConflict.cleanCode
        )}&name=${encodeURIComponent(nameConflict.originalName)}`
      );
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setNameConflict((prev) =>
          prev ? { ...prev, suggestions: data.suggestions } : null
        );
      }
    } catch {
      // safe fallback
    } finally {
      setIsGeneratingMore(false);
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

          {nameConflict ? (
            /* Choose your display name - Name collision selection interface */
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNameConflict(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="inline-flex items-center gap-1.5 text-purple-400 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Choose your display name</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-white mb-1">
                  Name already in use
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Another participant in this room is already named{' '}
                  <strong className="text-purple-300 font-semibold">{nameConflict.originalName}</strong>.
                  Choose an available option below to step right in:
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {error}
                </div>
              )}

              {/* Attractive list of generated options */}
              <div className="flex flex-col gap-2 pt-1">
                {nameConflict.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setDisplayName(suggestion);
                      void executeJoinWithName(nameConflict.cleanCode, suggestion);
                    }}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/25 hover:to-indigo-500/25 hover:border-purple-400/60 text-white font-medium transition-all shadow-md active:scale-[0.98] group cursor-pointer"
                  >
                    <span className="font-semibold text-sm text-purple-200 group-hover:text-white transition-colors">
                      {suggestion}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-500/25 text-purple-200 border border-purple-500/40 group-hover:bg-purple-500 group-hover:text-white transition-all">
                      {isLoading ? 'Joining...' : 'Select & Join'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Generate more options button */}
              <button
                type="button"
                disabled={isGeneratingMore || isLoading}
                onClick={handleGenerateMoreOptions}
                className="mt-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-white/20 text-xs font-medium text-slate-300 hover:text-white hover:border-purple-400/50 hover:bg-white/5 transition-all cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-purple-400 ${isGeneratingMore ? 'animate-spin' : ''}`} />
                <span>{isGeneratingMore ? 'Finding new options...' : 'Generate more options'}</span>
              </button>
            </div>
          ) : (
            /* Standard initial join form */
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
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-purple-400 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
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
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
