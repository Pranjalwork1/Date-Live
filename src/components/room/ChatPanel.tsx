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

const QUICK_REACTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🍿', label: 'Popcorn!' },
  { emoji: '🥺', label: 'Aww' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '✨', label: 'Sweet' },
  { emoji: '🎬', label: 'Shh!' },
  { emoji: '💖', label: 'Hugs' },
];

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message or when opened
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Adjust textarea height dynamically up to 4 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = async (contentToSend?: string) => {
    const text = (contentToSend ?? inputText).trim();
    if (!text || isSending) return;

    if (!contentToSend) {
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
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
    // Only send on Enter on non-touch desktop (without Shift)
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
    <>
      {/* Mobile Dimmed Backdrop — tap anywhere outside to close */}
      <div
        className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs transition-opacity duration-300 sm:hidden animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Chat Drawer / Side Panel */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 flex flex-col shadow-2xl backdrop-blur-2xl transition-all duration-300 border-l"
        style={{
          backgroundColor: mood.cardBg,
          borderColor: mood.cardBorder,
        }}
        aria-label="Room Messages Chat Panel"
      >
        {/* Header with Safe Area Inset & Mobile Grab Pill */}
        <div
          className="flex flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 border-b bg-white/5 shrink-0"
          style={{ borderColor: mood.cardBorder }}
        >
          {/* Subtle mobile pull indicator */}
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full shadow-sm"
                style={{
                  backgroundColor: `${mood.accentFrom}25`,
                  color: mood.accentTextColor,
                }}
              >
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight">Little messages</span>
                <span className="text-[10px] text-slate-400">Private room chat · {mood.name}</span>
              </div>
            </div>

            {/* Generous touch target for closing on phones (36px+) */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95 border border-white/15 shadow-sm"
              aria-label="Close chat"
            >
              <X className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Close</span>
            </button>
          </div>
        </div>

        {/* Message List */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-3 space-y-3.5 scroll-smooth overscroll-contain"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 select-none">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full mb-3 animate-pulse shadow-md"
                style={{
                  backgroundColor: `${mood.accentFrom}20`,
                  color: mood.accentTextColor,
                }}
              >
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <p className="text-sm text-white font-medium mb-1">Send the first little message ✨</p>
              <p className="text-xs text-slate-400 leading-relaxed font-light max-w-xs">
                Whisper sweet notes, react to plot twists, or share a thought without interrupting the movie.
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
                  className={`flex gap-2 sm:gap-2.5 ${isSelf ? 'flex-row-reverse' : 'flex-row'} items-end`}
                >
                  {/* Mini Sender Avatar */}
                  <div
                    className="h-7 w-7 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                    style={{
                      background: isSelf
                        ? `linear-gradient(135deg, ${mood.accentFrom}, ${mood.accentTo})`
                        : 'linear-gradient(135deg, #a855f7, #6366f1)',
                    }}
                    title={m.sender_name}
                  >
                    {initials}
                  </div>

                  <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[80%]`}>
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-medium text-slate-300">
                        {isSelf ? 'You' : m.sender_name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{formatTime(m.created_at)}</span>
                    </div>
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-[13px] sm:text-xs leading-relaxed break-words shadow-md ${
                        isSelf
                          ? 'text-white rounded-br-xs'
                          : 'bg-white/12 text-slate-100 border border-white/10 rounded-bl-xs'
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
          <div className="px-4 py-1.5 bg-rose-500/20 text-rose-300 text-xs border-t border-rose-500/30">
            {sendError}
          </div>
        )}

        {/* Input Box with Scrollable Quick-Reaction Ribbon & Safe-Area Padding */}
        <div
          className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t bg-black/75 backdrop-blur-md shrink-0"
          style={{ borderColor: mood.cardBorder }}
        >
          {/* Edge-to-edge horizontally scrollable quick replies */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar select-none">
            {QUICK_REACTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSend(`${item.emoji} ${item.label}`)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/6 hover:bg-white/12 text-xs sm:text-[11px] text-slate-200 border border-white/10 transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
              >
                <span>{item.emoji}</span>
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            {/* Font size 16px (text-base) on mobile is MANDATORY to prevent iOS Safari auto-zoom! */}
            <textarea
              ref={textareaRef}
              rows={1}
              maxLength={2000}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Whisper a message..."
              className="w-full resize-none rounded-xl border border-white/20 bg-white/5 pl-3.5 pr-12 py-2.5 text-base sm:text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-400/50 transition-all min-h-[42px] max-h-[120px]"
              style={{
                borderColor: mood.cardBorder,
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-white disabled:opacity-30 transition-all active:scale-95 cursor-pointer shadow-md"
              style={{
                background: `linear-gradient(135deg, ${mood.accentFrom}, ${mood.accentTo})`,
                boxShadow: `0 4px 12px ${mood.glowColor}`,
              }}
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              )}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
