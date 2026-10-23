'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, Heart, Loader2 } from 'lucide-react';
import { RoomMessage } from '@/lib/types';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: RoomMessage[];
  onSendMessage: (content: string) => Promise<void>;
  currentUserId: string;
}

export default function ChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserId,
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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);
    setSendError(null);

    try {
      await onSendMessage(content);
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Message failed to send');
      setInputText(content); // restore text on failure
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 md:w-96 flex flex-col bg-[#0b0d1b]/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">Movie Date Chat</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-3 animate-pulse">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <p className="text-xs text-white font-medium mb-1">Your private chat</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Whisper notes, react to plot twists, or share a sweet thought without breaking the movie audio.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isSelf = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-medium text-slate-400">
                    {isSelf ? 'You' : m.sender_name}
                  </span>
                  <span className="text-[9px] text-slate-500">{formatTime(m.created_at)}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words shadow-md ${
                    isSelf
                      ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white rounded-br-xs'
                      : 'bg-white/10 text-slate-200 border border-white/10 rounded-bl-xs'
                  }`}
                >
                  {m.content}
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

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40">
        <div className="relative flex items-center">
          <textarea
            rows={1}
            maxLength={2000}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Whisper a message... (Enter to send)"
            className="w-full resize-none rounded-xl border border-white/15 bg-white/5 pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:border-rose-500/60 focus:bg-white/10 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="absolute right-2 p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-400 disabled:opacity-40 disabled:hover:bg-rose-500 transition-all active:scale-95"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
