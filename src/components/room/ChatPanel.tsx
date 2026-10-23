'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, Heart, Loader2 } from 'lucide-react';
import { RoomMessage, ThemeType } from '@/lib/types';
import { THEMES, normalizeTheme } from '@/lib/themes';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: RoomMessage[];
  onSendMessage: (content: string) => Promise<void>;
  currentUserId: string;
  theme?: ThemeType;
}

export default function ChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserId,
  theme,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (contentToSend?: string) => {
    const text = (contentToSend ?? inputText).trim();
    if (!text || isSending) return;

    setInputText('');
    setIsSending(true);
    setSendError(null);

    try {
      await onSendMessage(text);
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Message failed to send');
      if (!contentToSend) setInputText(text); // restore text on failure
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const mood = THEMES[normalizeTheme(theme)] || THEMES.midnight;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 md:w-96 flex flex-col shadow-2xl backdrop-blur-2xl transition-all duration-500 border-l"
      style={{
        backgroundColor: mood.cardBg,
        borderColor: mood.cardBorder,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b bg-white/5"
        style={{ borderColor: mood.cardBorder }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${mood.accentFrom}25`,
              color: mood.accentTextColor,
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white tracking-tight">Little messages</span>
            <span className="text-[10px] text-slate-400">Private room chat · {mood.name} mood</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 select-none">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full mb-3 animate-pulse"
              style={{
                backgroundColor: `${mood.accentFrom}20`,
                color: mood.accentTextColor,
              }}
            >
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <p className="text-xs text-white font-medium mb-1">Send the first little message ✨</p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-light">
              Whisper notes, react to plot twists, or share a sweet thought without breaking the movie audio.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isSelf = m.sender_id === currentUserId;
            const initials = (m.sender_name || 'U')
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isSelf ? 'flex-row-reverse' : 'flex-row'} items-end`}
              >
                {/* Mini Sender Avatar */}
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                  style={{
                    background: isSelf
                      ? `linear-gradient(135deg, ${mood.accentFrom}, ${mood.accentTo})`
                      : 'linear-gradient(135deg, #a855f7, #6366f1)',
                  }}
                  title={m.sender_name}
                >
                  {initials}
                </div>

                <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-medium text-slate-400">
                      {isSelf ? 'You' : m.sender_name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{formatTime(m.created_at)}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words shadow-md ${
                      isSelf ? 'text-white rounded-br-xs' : 'bg-white/10 text-slate-200 border border-white/10 rounded-bl-xs'
                    }`}
                    style={
                      isSelf
                        ? {
                            background: `linear-gradient(135deg, ${mood.accentFrom}, ${mood.accentTo})`,
                            boxShadow: `0 4px 14px ${mood.glowColor}`,
                          }
                        : undefined
                    }
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send Error Toast */}
      {sendError && (
        <div className="px-4 py-1.5 bg-rose-500/20 text-rose-300 text-[11px] border-t border-rose-500/30">
          {sendError}
        </div>
      )}

      {/* Input Box with Quick Love Shortcut */}
      <div
        className="p-3 border-t bg-black/60"
        style={{ borderColor: mood.cardBorder }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <button
            type="button"
            onClick={() => handleSend('❤️')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[11px] border transition-all cursor-pointer active:scale-95"
            style={{
              borderColor: mood.cardBorder,
              color: mood.accentTextColor,
            }}
          >
            <span>❤️</span>
            <span className="text-[10px]">Send Love</span>
          </button>
          <button
            type="button"
            onClick={() => handleSend('🍿 Popcorn moment!')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/20 text-amber-300 text-[11px] border border-white/5 transition-all cursor-pointer active:scale-95"
          >
            <span>🍿</span>
            <span className="text-[10px]">Popcorn!</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <textarea
            rows={1}
            maxLength={2000}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Whisper a message... (Enter to send)"
            className="w-full resize-none rounded-xl border border-white/15 bg-white/5 pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
            style={{
              borderColor: mood.cardBorder,
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="absolute right-2 p-1.5 rounded-lg text-white disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${mood.accentFrom}, ${mood.accentTo})`,
              boxShadow: `0 4px 12px ${mood.glowColor}`,
            }}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
