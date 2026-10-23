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
  Radio,
  Mic,
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
          className="text-base sm:text-lg text-slate-300/90 max-w-2xl font-light leading-relaxed mb-8"
        >
          Movie nights feel better together. Share your screen, hear every laugh, send a little love, and make the distance feel smaller.
        </motion.p>

        {/* Reassuring caption */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-xs text-rose-300/80 font-medium mb-8 flex items-center gap-2"
        >
          <span>Private rooms</span>
          <span className="text-slate-600">·</span>
          <span>Real-time reactions</span>
          <span className="text-slate-600">·</span>
          <span>Made for two</span>
        </motion.div>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16"
        >
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 px-8 py-4 text-sm sm:text-base font-semibold text-white shadow-xl shadow-rose-500/30 hover:opacity-95 hover:shadow-rose-500/40 active:scale-95 transition-all cursor-pointer"
          >
            <Heart className="h-4 w-4 fill-current text-white animate-pulse" />
            <span>Create a Date Room</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm sm:text-base font-medium text-slate-200 hover:bg-white/10 hover:text-white backdrop-blur-xl transition-all cursor-pointer"
          >
            <span>Join a Room</span>
          </button>
        </motion.div>

        {/* HERO VISUAL — REALISTIC CINEMATIC PRODUCT PREVIEW MOCKUP */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full max-w-4xl rounded-3xl border border-white/15 bg-black/75 p-3 sm:p-5 shadow-2xl backdrop-blur-2xl overflow-hidden"
          style={{
            boxShadow:
              '0 35px 90px -20px rgba(0, 0, 0, 0.95), 0 0 60px -10px rgba(244, 63, 94, 0.3)',
          }}
        >
          {/* Simulated Theater Screen Mockup */}
          <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-b from-[#0b0e24] via-[#070916] to-[#030408] border border-white/10 flex flex-col justify-between p-4 sm:p-8 overflow-hidden select-none">
            {/* Top Bar of Preview */}
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-white/10 backdrop-blur-xl text-xs text-rose-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]" />
                <span className="text-white font-semibold">Together now ❤️</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 text-[11px]">Alex & Maya</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 font-mono text-[11px]">
                  01:24:18
                </span>
                <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                  <Radio className="h-3 w-3" />
                  <span>Tab Sound Active</span>
                </span>
              </div>
            </div>

            {/* Central Movie Scene Preview with Floating Reaction */}
            <div className="relative flex flex-col items-center justify-center my-auto z-10 py-6">
              <div className="relative mb-3">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500/20 via-pink-500/10 to-purple-500/20 border border-rose-500/35 shadow-2xl shadow-rose-500/20 backdrop-blur-xl">
                  <Film className="h-10 w-10 sm:h-12 sm:w-12 text-rose-400 stroke-[1.2]" />
                </div>
                {/* Floating Heart Reactions Rising */}
                <motion.span
                  animate={{ y: [-10, -45], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute -top-3 -right-3 text-2xl"
                >
                  ❤️
                </motion.span>
                <motion.span
                  animate={{ y: [-5, -35], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: 1.2, ease: 'easeOut' }}
                  className="absolute -top-2 -left-4 text-xl"
                >
                  ✨
                </motion.span>
              </div>

              <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                Our Movie Night — Interstellar
              </span>
              <span className="text-xs text-rose-200/80 font-light mt-0.5">
                Streaming screen & crisp browser tab sound
              </span>
            </div>

            {/* Bottom Preview Bar: Two Avatar Chips + Mini Reaction Pill */}
            <div className="w-full flex items-center justify-between z-10 pt-2 border-t border-white/5">
              {/* Avatar Chips */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                    A
                  </div>
                  <span className="text-xs text-white font-medium">You</span>
                  <div className="flex items-center gap-0.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Mic className="h-3 w-3" />
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                    M
                  </div>
                  <span className="text-xs text-white font-medium">Maya</span>
                  <div className="flex items-center gap-0.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Mic className="h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Reaction Pill Preview */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 border border-white/15 backdrop-blur-xl text-sm">
                <span>❤️</span>
                <span>🍿</span>
                <span>🥰</span>
                <span className="text-[10px] text-slate-400 pl-1 hidden sm:inline">Apple-style reactions</span>
              </div>
            </div>

            {/* Ambient Background Glow in Screen */}
            <div className="absolute inset-0 bg-radial-gradient from-rose-500/15 via-purple-600/5 to-transparent pointer-events-none" />
          </div>

          {/* Subtitle Under Artwork */}
          <div className="flex items-center justify-between pt-3 px-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Private room for two with end-to-end media channels
            </span>
            <span className="hidden sm:inline text-rose-300 font-medium">LiveKit Cloud WebRTC Media Engine</span>
          </div>
        </motion.div>
      </section>

      {/* 3 COMPACT FEATURE HIGHLIGHTS */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Watch Together */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-1">
              <ScreenShare className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Watch Together</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Share your screen and supported browser-tab audio with crystal-clear synchronization.
            </p>
          </div>

          {/* Card 2: Feel Every Moment */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 mb-1">
              <Heart className="h-6 w-6 fill-purple-400/30" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Feel Every Moment</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Talk naturally, send messages, and react with a single tap using Apple-inspired floating emojis.
            </p>
          </div>

          {/* Card 3: Make It Yours */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-1">
              <Palette className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Make It Yours</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Choose cozy themes and create your own private movie-date space with ambient soundscapes.
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
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-light">
              Give your movie night a title, pick a romantic mood, and get a secure unguessable room code.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white font-bold text-base shadow-lg shadow-purple-500/30">
              2
            </div>
            <h3 className="text-sm font-semibold text-white">Share link with your person</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-light">
              Copy the private invitation link with one click and text it to your partner.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-500/30">
              3
            </div>
            <h3 className="text-sm font-semibold text-white">Share screen & enjoy</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-light">
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
