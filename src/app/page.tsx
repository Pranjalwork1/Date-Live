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
  Volume2,
  Play,
  CheckCircle2,
} from 'lucide-react';

const PREVIEW_MOODS = [
  {
    id: 'midnight',
    name: 'Midnight',
    icon: '🌌',
    glow: 'rgba(56, 189, 248, 0.35)',
    border: 'border-sky-500/30',
    bgGradient: 'from-[#081232] via-[#050B20] to-[#030612]',
    accentText: 'text-sky-300',
    badgeBg: 'bg-sky-500/20 border-sky-500/40 text-sky-200',
  },
  {
    id: 'candlelight',
    name: 'Candlelight',
    icon: '🕯️',
    glow: 'rgba(251, 146, 60, 0.35)',
    border: 'border-amber-500/30',
    bgGradient: 'from-[#281308] via-[#170904] to-[#0A0302]',
    accentText: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-200',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    icon: '💜',
    glow: 'rgba(192, 132, 252, 0.35)',
    border: 'border-purple-500/30',
    bgGradient: 'from-[#220B38] via-[#140624] to-[#08020E]',
    accentText: 'text-purple-300',
    badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-200',
  },
  {
    id: 'cinema',
    name: 'Cinema',
    icon: '🎬',
    glow: 'rgba(244, 63, 94, 0.35)',
    border: 'border-rose-500/30',
    bgGradient: 'from-[#2A0813] via-[#16030A] to-[#070104]',
    accentText: 'text-rose-300',
    badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-200',
  },
];

export default function LandingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectedMoodId, setSelectedMoodId] = useState('midnight');

  const currentMood = PREVIEW_MOODS.find((m) => m.id === selectedMoodId) || PREVIEW_MOODS[0];

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between bg-gradient-to-b from-[#080A18] via-[#0E122C] to-[#150B22] text-[#F8FAFC] selection:bg-[#FF6B9A] selection:text-white overflow-x-hidden">
      {/* Ambient Starfield & Soft Atmospheric Glows */}
      <Starfield density={75} />

      {/* Atmospheric Background Glow Spots */}
      <div
        className="absolute top-1/4 left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-25 transition-all duration-700"
        style={{ background: currentMood.glow }}
      />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-[#FF6B9A]/15 blur-[160px] pointer-events-none" />

      {/* Floating Dynamic Island Capsule */}
      <DynamicIsland
        mode="landing"
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenJoin={() => setIsJoinOpen(true)}
      />

      {/* HERO SECTION — TWO COLUMN LAYOUT ON DESKTOP */}
      <section className="relative z-10 pt-24 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: Eyebrow, Heading, Description, CTAs, Privacy Info */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Eyebrow Label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#FF6B9A]/30 bg-[#FF6B9A]/10 px-3.5 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#FF6B9A] uppercase shadow-sm shadow-[#FF6B9A]/20 mb-5 sm:mb-6 backdrop-blur-md"
            >
              <Sparkles className="h-3 w-3 text-[#FF6B9A]" />
              <span>A little closer, even from afar</span>
            </motion.div>

            {/* Large Beautifully Typeset Heading with Editorial Accent */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-4 sm:mb-6"
            >
              Your favorite movie.{' '}
              <span className="font-editorial italic font-normal tracking-wide text-4xl sm:text-6xl md:text-7xl bg-gradient-to-r from-[#FF6B9A] via-[#FDA4AF] to-[#C084FC] bg-clip-text text-transparent block my-1">
                Your favorite person.
              </span>
              One shared moment.
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-lg text-slate-300 font-light leading-relaxed mb-6 sm:mb-8 max-w-xl"
            >
              Movie nights feel better together. Share your screen with movie audio, see each other in candlelit clarity, send animated hearts, and make the distance feel smaller.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto mb-4"
            >
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-full bg-gradient-to-r from-[#FF6B9A] via-[#F43F5E] to-[#E11D48] px-7 sm:px-8 py-3.5 text-sm sm:text-base font-semibold text-white shadow-xl shadow-[#FF6B9A]/30 hover:opacity-95 hover:shadow-[#FF6B9A]/40 active:scale-95 transition-all cursor-pointer"
              >
                <Heart className="h-4 w-4 fill-current text-white animate-pulse" />
                <span>Create a Date Room</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsJoinOpen(true)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-6 sm:px-7 py-3.5 text-sm sm:text-base font-medium text-slate-200 hover:text-white backdrop-blur-xl transition-all cursor-pointer"
              >
                <span>Join a Room</span>
              </button>
            </motion.div>

            {/* Trust & Instant Onboarding Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs text-rose-200/90 font-medium"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>No sign-up or app download · 100% free · Ready in 5 seconds</span>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Interactive Movie Room Preview Mockup with Live Video Call Bubbles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-6 relative w-full"
          >
            {/* Glowing Ambient Light Backdrop tied to selected mood */}
            <div
              className="absolute -inset-3 rounded-3xl blur-3xl pointer-events-none transition-all duration-700 opacity-60"
              style={{ background: currentMood.glow }}
            />

            {/* Cinema Stage Frame Mockup */}
            <div
              className={`relative rounded-3xl border ${currentMood.border} bg-black/85 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl overflow-hidden select-none transition-colors duration-500`}
              style={{
                boxShadow: `0 30px 80px -20px rgba(0, 0, 0, 0.95), 0 0 50px -10px ${currentMood.glow}`,
              }}
            >
              {/* 16:9 Screen Stage Container */}
              <div
                className={`relative aspect-video w-full rounded-2xl bg-gradient-to-b ${currentMood.bgGradient} border border-white/10 flex flex-col justify-between p-4 sm:p-5 overflow-hidden transition-all duration-500`}
              >
                {/* Top Status Capsule in Mockup */}
                <div className="w-full flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-white/10 backdrop-blur-xl text-xs font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]" />
                    <span className="text-white font-semibold">Together now ❤️</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium backdrop-blur-md">
                      <Radio className="h-3 w-3" />
                      <span>Tab Sound Active</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/15 text-[10px] font-medium">
                      <span>{currentMood.icon} {currentMood.name}</span>
                    </div>
                  </div>
                </div>

                {/* Central Movie Scene Preview with Celestial Glow */}
                <div className="relative flex flex-col items-center justify-center my-auto z-10 py-2">
                  <div className="relative mb-2">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6B9A]/20 to-[#C084FC]/20 border border-[#FF6B9A]/30 shadow-xl shadow-[#FF6B9A]/20 backdrop-blur-xl group">
                      <Play className="h-6 w-6 sm:h-7 sm:w-7 text-[#FF6B9A] fill-[#FF6B9A]/40 ml-0.5" />
                    </div>

                    {/* Animated Floating Heart Reactions */}
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
                    Our Movie Night — Interstellar (2014)
                  </span>
                  <span className="text-[11px] text-rose-200/80 font-light mt-0.5">
                    Streaming crisp browser tab audio with live face video
                  </span>

                  {/* Simulated Playback Progress Bar */}
                  <div className="w-full max-w-xs flex items-center gap-2 mt-3 px-2">
                    <span className="text-[9px] font-mono text-slate-400">01:24:18</span>
                    <div className="relative flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#FF6B9A] to-[#C084FC] w-[58%]" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">02:49:00</span>
                    <Volume2 className="h-3 w-3 text-emerald-400" />
                  </div>
                </div>

                {/* Picture-in-Picture Webcam Overlays */}
                <div className="absolute right-3 sm:right-4 bottom-14 flex items-center gap-2 z-20">
                  {/* Partner Camera Tile */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/85 border border-[#FF6B9A]/40 backdrop-blur-md shadow-lg shadow-black/80">
                    <div className="relative h-6 w-6 sm:h-7 sm:w-7 rounded-lg overflow-hidden bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-xs">
                      👩‍🦰
                      <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 border border-black" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-semibold text-white leading-tight">Partner</span>
                      <span className="text-[8px] text-rose-300 font-medium">✨ Warm Glow</span>
                    </div>
                  </div>

                  {/* You Camera Tile */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/85 border border-white/20 backdrop-blur-md shadow-lg shadow-black/80">
                    <div className="relative h-6 w-6 sm:h-7 sm:w-7 rounded-lg overflow-hidden bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xs">
                      👦
                      <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 border border-black" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-semibold text-white leading-tight">You</span>
                      <span className="text-[8px] text-emerald-300 font-medium">HD 720p</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Two Participant Chips & Reaction Pill */}
                <div className="w-full flex items-center justify-between z-10 pt-2 border-t border-white/5 gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                    <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                      <div className="h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full bg-gradient-to-tr from-[#FF6B9A] to-[#FDA4AF] flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-white">
                        Y
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-white font-medium">You</span>
                      <Mic className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                      <div className="h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full bg-gradient-to-tr from-[#C084FC] to-[#818CF8] flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-white">
                        P
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-white font-medium truncate max-w-[65px] sm:max-w-none">Partner</span>
                      <Mic className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                    </div>
                  </div>

                  {/* Reaction Pill Preview */}
                  <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/75 border border-white/15 backdrop-blur-xl text-[10px] sm:text-xs shrink-0">
                    <span>❤️</span>
                    <span>🍿</span>
                    <span>😍</span>
                  </div>
                </div>

                {/* Soft Radial Ambient Lighting */}
                <div className="absolute inset-0 bg-radial-gradient from-[#FF6B9A]/15 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Interactive Mood Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 px-1 border-t border-white/10">
                <span className="text-[11px] text-slate-400 font-light flex items-center gap-1.5">
                  <Palette className="h-3 w-3 text-rose-300" />
                  <span>Try room moods:</span>
                </span>
                <div className="flex items-center gap-1">
                  {PREVIEW_MOODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMoodId(m.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer ${
                        selectedMoodId === m.id
                          ? `${m.badgeBg} shadow-md`
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span className="hidden sm:inline">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Security Caption */}
              <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-slate-400 font-light">
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-rose-300 uppercase tracking-wider mb-3">
            <Heart className="h-3 w-3 fill-current" />
            <span>Built for two hearts, miles apart</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Everything you need for an unforgettable movie date
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light max-w-lg mx-auto">
            Every feature is crafted to feel effortless, intimate, and private, like sitting right next to each other on the couch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Watch Together with Tab Audio */}
          <div className="group rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-all hover:-translate-y-1 hover:border-[#FF6B9A]/30 hover:bg-white/[0.07]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF6B9A]/20 text-[#FF6B9A] mb-1 group-hover:scale-105 transition-transform">
              <ScreenShare className="h-6 w-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-rose-300 uppercase tracking-wider">
              <span>Crisp Tab Audio</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Watch in Perfect Sync</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Share Netflix, YouTube, or your browser tab with full movie sound and zero delay. No awkward 3-2-1 count-downs.
            </p>
          </div>

          {/* Card 2: Low-Light Night Boost Camera */}
          <div className="group rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-all hover:-translate-y-1 hover:border-[#C084FC]/30 hover:bg-white/[0.07]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C084FC]/20 text-[#C084FC] mb-1 group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
              <span>Low-Light Night Boost</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">See Each Other In The Dark</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Hardware-tuned camera clarity for cozy dimmed rooms. Switch between Studio HD, Candlelight Warm Glow, and Natural modes.
            </p>
          </div>

          {/* Card 3: Ambient Soundscapes & Reactions */}
          <div className="group rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl flex flex-col gap-3 transition-all hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.07]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 mb-1 group-hover:scale-105 transition-transform">
              <Palette className="h-6 w-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
              <span>Atmospheric Moods</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Rain & Candlelight Ambience</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Set the mood with rain or vinyl crackle ambience, customizable room themes, and floating hearts you can tap together.
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
