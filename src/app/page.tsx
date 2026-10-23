'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Starfield from '@/components/Starfield';
import DynamicIsland from '@/components/island/DynamicIsland';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import JoinRoomModal from '@/components/modals/JoinRoomModal';
import {
  Film,
  Heart,
  Sparkles,
  ScreenShare,
  Palette,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function LandingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between bg-gradient-to-b from-[#060814] via-[#0c1026] to-[#12081d] text-white selection:bg-rose-500 selection:text-white overflow-x-hidden">
      {/* Ambient Starfield & Atmospheric Glows */}
      <Starfield density={80} />

      {/* Floating Dynamic Island Capsule */}
      <DynamicIsland
        mode="landing"
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenJoin={() => setIsJoinOpen(true)}
      />

      {/* HERO SECTION */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col items-center text-center">
        {/* Subtle pill tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-medium text-rose-300 shadow-sm shadow-rose-500/20 mb-6 backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-rose-400" />
          <span>Different places. One little movie night.</span>
        </motion.div>

        {/* Cinematic Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6"
        >
          Your favorite movie.{' '}
          <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-purple-400 bg-clip-text text-transparent">
            Your favorite person.
          </span>{' '}
          One shared moment.
        </motion.h1>

        {/* Supporting description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-300/90 max-w-2xl font-light leading-relaxed mb-10"
        >
          Create a little space for the two of you. Watch together, talk, laugh, and send a little love, even when you&apos;re miles apart.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16"
        >
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 px-8 py-4 text-sm sm:text-base font-semibold text-white shadow-xl shadow-rose-500/30 hover:opacity-95 hover:shadow-rose-500/40 active:scale-95 transition-all"
          >
            <Heart className="h-4 w-4 fill-current text-white animate-pulse" />
            <span>Create a Date Room</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm sm:text-base font-medium text-slate-200 hover:bg-white/10 hover:text-white backdrop-blur-xl transition-all"
          >
            <span>Join with an Invite Link</span>
          </button>
        </motion.div>

        {/* CINEMATIC COZY ROOM CSS ARTWORK */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full max-w-4xl rounded-3xl border border-white/15 bg-black/60 p-3 sm:p-5 shadow-2xl backdrop-blur-2xl overflow-hidden"
          style={{
            boxShadow:
              '0 30px 80px -20px rgba(0, 0, 0, 0.9), 0 0 50px -10px rgba(244, 63, 94, 0.25)',
          }}
        >
          {/* Simulated Theater Screen Inside Artwork */}
          <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-b from-[#0f1429] via-[#090b16] to-[#04050a] border border-white/10 flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden">
            {/* Top Bar of Simulated Screen */}
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-xs text-rose-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span>Streaming together</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 font-mono">
                  01:24:18
                </span>
              </div>
            </div>

            {/* Center Romantic Scene Graphic */}
            <div className="relative flex flex-col items-center my-auto z-10">
              <div className="relative mb-4">
                <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-500/30 shadow-2xl shadow-rose-500/30 backdrop-blur-xl">
                  <Film className="h-10 w-10 sm:h-14 sm:w-14 text-rose-400 stroke-[1.2]" />
                </div>
                {/* Floating Love Emojis */}
                <span className="absolute -top-3 -right-4 text-2xl animate-bounce">❤️</span>
                <span className="absolute -bottom-2 -left-4 text-2xl">🍿</span>
                <span className="absolute top-1/2 -left-8 text-xl">✨</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Our Little Midnight Cinema
              </p>
              <p className="text-xs sm:text-sm text-rose-200/80 font-light">
                High definition screen share with crisp browser tab movie sound
              </p>
            </div>

            {/* Simulated Floating Reaction Bar at bottom */}
            <div className="z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-black/75 border border-white/15 backdrop-blur-xl text-lg sm:text-xl shadow-lg">
              <span>❤️</span>
              <span>😍</span>
              <span>🍿</span>
              <span>✨</span>
              <span className="text-xs text-slate-400 pl-2 hidden sm:inline">
                Instant Apple-style reactions
              </span>
            </div>

            {/* Ambient Background Glow in Screen */}
            <div className="absolute inset-0 bg-radial-gradient from-rose-500/10 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Subtitle Under Artwork */}
          <div className="flex items-center justify-between pt-3 px-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Private room for two with end-to-end media channels
            </span>
            <span className="hidden sm:inline text-rose-300">LiveKit Audio & Screen Transport</span>
          </div>
        </motion.div>
      </section>

      {/* 3 COMPACT FEATURE HIGHLIGHTS */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-1">
              <ScreenShare className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Watch together</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Share your browser tab, streaming video, or player window with real-time audio synchronization.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 mb-1">
              <Heart className="h-6 w-6 fill-purple-400/30" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Feel closer</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Talk without disturbing movie sound, send live whispers in chat, and trigger floating Apple-style reactions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-1">
              <Palette className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Make it yours</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Pick from four romantic moods: Midnight Romance, Candlelight, Dreamy Lavender, or Cozy Cinema.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          How It Works
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-12">
          No mandatory long sign-up forms. Get into your private date room in under 10 seconds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-base shadow-lg shadow-rose-500/30">
              1
            </div>
            <h3 className="text-sm font-semibold text-white">Create your private room</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Give your movie night a title, pick a romantic mood, and get a secure unguessable room code.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white font-bold text-base shadow-lg shadow-purple-500/30">
              2
            </div>
            <h3 className="text-sm font-semibold text-white">Share link with your person</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Copy the private invitation link with one click and text it to your partner.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-500/30">
              3
            </div>
            <h3 className="text-sm font-semibold text-white">Share screen & enjoy</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Click &apos;Share Screen&apos;, select your movie tab with tab audio checked, and enjoy the night.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-4 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2 text-rose-300/80 font-medium">
          <Heart className="h-3.5 w-3.5 fill-current text-rose-400" />
          <span>Moonlit — Watch Together</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Different places. One little movie night. Designed with love.
        </p>
      </footer>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
    </div>
  );
}
