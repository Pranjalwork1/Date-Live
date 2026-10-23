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
    <div className="min-h-screen w-full relative flex flex-col justify-between bg-gradient-to-b from-[#080A18] via-[#0E122C] to-[#150B22] text-[#F8FAFC] selection:bg-[#FF6B9A] selection:text-white overflow-x-hidden">
      {/* Ambient Starfield & Soft Atmospheric Glows */}
      <Starfield density={75} />

      {/* Floating Dynamic Island Capsule */}
      <DynamicIsland
        mode="landing"
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenJoin={() => setIsJoinOpen(true)}
      />

      {/* HERO SECTION — TWO COLUMN LAYOUT ON DESKTOP */}
      <section className="relative z-10 pt-28 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: Eyebrow, Heading, Description, CTAs, Privacy Info */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Eyebrow Label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#FF6B9A]/30 bg-[#FF6B9A]/10 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-[#FF6B9A] uppercase shadow-sm shadow-[#FF6B9A]/20 mb-6 backdrop-blur-md"
            >
              <Sparkles className="h-3 w-3 text-[#FF6B9A]" />
              <span>A little closer, even from afar</span>
            </motion.div>

            {/* Large Beautifully Typeset Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6"
            >
              Your favorite movie.{' '}
              <span className="bg-gradient-to-r from-[#FF6B9A] via-[#FDA4AF] to-[#C084FC] bg-clip-text text-transparent">
                Your favorite person.
              </span>{' '}
              One shared moment.
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-8 max-w-xl"
            >
              Movie nights feel better together. Share your screen, hear every laugh, send a little love, and make the distance feel smaller.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-6"
            >
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-full bg-gradient-to-r from-[#FF6B9A] via-[#F43F5E] to-[#E11D48] px-8 py-3.5 text-sm sm:text-base font-semibold text-white shadow-xl shadow-[#FF6B9A]/30 hover:opacity-95 hover:shadow-[#FF6B9A]/40 active:scale-95 transition-all cursor-pointer"
              >
                <Heart className="h-4 w-4 fill-current text-white animate-pulse" />
                <span>Create a Date Room</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsJoinOpen(true)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-7 py-3.5 text-sm sm:text-base font-medium text-slate-200 hover:text-white backdrop-blur-xl transition-all cursor-pointer"
              >
                <span>Join a Room</span>
              </button>
            </motion.div>

            {/* Small Privacy & Real-Time Features Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-2 text-xs text-rose-300/80 font-medium"
            >
              <span>Private rooms</span>
              <span className="text-slate-600">·</span>
              <span>Real-time reactions</span>
              <span className="text-slate-600">·</span>
              <span>Made for two</span>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Large Attractive Movie Room Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-6 relative w-full"
          >
            {/* Glowing Ambient Light Backdrop */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#FF6B9A]/20 via-[#C084FC]/15 to-transparent blur-2xl pointer-events-none" />

            {/* Cinema Stage Frame Mockup */}
            <div
              className="relative rounded-3xl border border-white/15 bg-black/80 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl overflow-hidden select-none"
              style={{
                boxShadow:
                  '0 30px 80px -20px rgba(0, 0, 0, 0.95), 0 0 50px -10px rgba(255, 107, 154, 0.3)',
              }}
            >
              {/* 16:9 Screen Stage Container */}
              <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-b from-[#0B0F28] via-[#07091A] to-[#04050D] border border-white/10 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
                {/* Top Status Capsule in Mockup */}
                <div className="w-full flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-white/10 backdrop-blur-xl text-xs font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]" />
                    <span className="text-white font-semibold">Together now ❤️</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium backdrop-blur-md">
                    <Radio className="h-3 w-3" />
                    <span>Tab Sound Active</span>
                  </div>
                </div>

                {/* Central Movie Scene Preview with Rising Reaction */}
                <div className="relative flex flex-col items-center justify-center my-auto z-10 py-3">
                  <div className="relative mb-3">
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6B9A]/20 to-[#C084FC]/20 border border-[#FF6B9A]/30 shadow-xl shadow-[#FF6B9A]/20 backdrop-blur-xl">
                      <Film className="h-8 w-8 sm:h-10 sm:w-10 text-[#FF6B9A] stroke-[1.2]" />
                    </div>

                    {/* Animated Floating Heart Reaction */}
                    <motion.span
                      animate={{ y: [-5, -35], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.9] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute -top-3 -right-3 text-2xl"
                    >
                      ❤️
                    </motion.span>
                    <motion.span
                      animate={{ y: [-3, -28], opacity: [0, 1, 0], scale: [0.7, 1.1, 0.8] }}
                      transition={{ duration: 2.7, repeat: Infinity, delay: 1.1, ease: 'easeOut' }}
                      className="absolute -top-2 -left-3 text-lg"
                    >
                      ✨
                    </motion.span>
                  </div>

                  <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Our Movie Night — Interstellar
                  </span>
                  <span className="text-[11px] text-rose-200/80 font-light mt-0.5">
                    Streaming screen & crisp browser tab sound
                  </span>
                </div>

                {/* Bottom Bar: Two Participant Chips & Reaction Pill */}
                <div className="w-full flex items-center justify-between z-10 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {/* Participant Chip: You */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                      <div className="h-4.5 w-4.5 rounded-full bg-gradient-to-tr from-[#FF6B9A] to-[#FDA4AF] flex items-center justify-center text-[9px] font-bold text-white">
                        Y
                      </div>
                      <span className="text-[11px] text-white font-medium">You</span>
                      <Mic className="h-3 w-3 text-emerald-400" />
                    </div>

                    {/* Participant Chip: Your Person */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                      <div className="h-4.5 w-4.5 rounded-full bg-gradient-to-tr from-[#C084FC] to-[#818CF8] flex items-center justify-center text-[9px] font-bold text-white">
                        P
                      </div>
                      <span className="text-[11px] text-white font-medium">Your person</span>
                      <Mic className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>

                  {/* Reaction Pill Preview */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 border border-white/15 backdrop-blur-xl text-xs">
                    <span>❤️</span>
                    <span>🍿</span>
                    <span>😍</span>
                  </div>
                </div>

                {/* Soft Radial Ambient Lighting */}
                <div className="absolute inset-0 bg-radial-gradient from-[#FF6B9A]/15 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Bottom Security Caption */}
              <div className="flex items-center justify-between pt-2.5 px-1 text-[11px] text-slate-400 font-light">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Private room for two with end-to-end media channels
                </span>
                <span className="text-[#FF6B9A] font-medium hidden sm:inline">LiveKit WebRTC</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3 COMPACT FEATURE HIGHLIGHTS */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Watch Together */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B9A]/20 text-[#FF6B9A] mb-1">
              <ScreenShare className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Watch Together</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Share your screen and supported browser-tab audio with crystal-clear synchronization.
            </p>
          </div>

          {/* Card 2: Feel Every Moment */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C084FC]/20 text-[#C084FC] mb-1">
              <Heart className="h-6 w-6 fill-[#C084FC]/30" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Feel Every Moment</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Talk naturally, send messages, and react with a single tap using Apple-inspired floating emojis.
            </p>
          </div>

          {/* Card 3: Make It Yours */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-transform hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 mb-1">
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
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-12 font-light">
          No mandatory long sign-up forms. Get into your private date room in under 10 seconds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6B9A] text-white font-bold text-base shadow-lg shadow-[#FF6B9A]/30">
              1
            </div>
            <h3 className="text-sm font-semibold text-white">Create your private room</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-light">
              Give your movie night a title, pick a romantic mood, and get a secure unguessable room code.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C084FC] text-white font-bold text-base shadow-lg shadow-[#C084FC]/30">
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
          <Heart className="h-3.5 w-3.5 fill-current text-[#FF6B9A]" />
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
