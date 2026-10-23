'use client';

import React, { useRef, useEffect } from 'react';
import {
  Film,
  Maximize2,
  Minimize2,
  Tv,
  Volume2,
  VolumeX,
  Info,
  Radio,
  Moon,
  ScreenShare,
} from 'lucide-react';
import { ThemeType } from '@/lib/types';
import { THEMES } from '@/lib/themes';

interface ScreenStageProps {
  stream: MediaStream | null;
  audioStream?: MediaStream | null;
  isSharing: boolean;
  sharerName: string;
  isLocalSharing: boolean;
  hasTabAudio: boolean;
  theme: ThemeType;
  isTheaterMode: boolean;
  onToggleTheaterMode: () => void;
  onOpenAudioHelp: () => void;
  onStartScreenShare?: () => void;
}

export default function ScreenStage({
  stream,
  audioStream,
  isSharing,
  sharerName,
  isLocalSharing,
  hasTabAudio,
  theme,
  isTheaterMode,
  onToggleTheaterMode,
  onOpenAudioHelp,
  onStartScreenShare,
}: ScreenStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isAudioMuted, setIsAudioMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(1);

  // Attach video stream
  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn('Video autoplay prevented or failed:', err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  // Attach separate screen audio stream if remote
  useEffect(() => {
    if (audioRef.current) {
      if (audioStream && !isLocalSharing) {
        audioRef.current.srcObject = audioStream;
        audioRef.current.volume = volume;
        audioRef.current.play().catch((err) => {
          console.warn('Screen audio playback interrupted:', err);
        });
      } else {
        audioRef.current.srcObject = null;
      }
    }
  }, [audioStream, isLocalSharing, volume]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val === 0) setIsAudioMuted(true);
    else setIsAudioMuted(false);
  };

  const toggleMuteAudio = () => {
    if (audioRef.current) {
      const next = !isAudioMuted;
      setIsAudioMuted(next);
      audioRef.current.muted = next;
    }
  };

  const currentTheme = THEMES[theme];

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 flex flex-col items-center justify-center overflow-hidden rounded-3xl border ${currentTheme.border} bg-black/75 backdrop-blur-xl transition-all duration-300 w-full aspect-video min-h-[340px] sm:min-h-[480px]`}
      style={{
        boxShadow: isSharing
          ? '0 30px 80px -15px rgba(0, 0, 0, 0.95), 0 0 45px -5px rgba(244, 63, 94, 0.25)'
          : '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 30px -8px rgba(244, 63, 94, 0.15)',
      }}
    >
      {/* Soft radial aura behind video stage */}
      <div className="absolute inset-0 bg-radial-gradient from-rose-500/10 via-purple-600/5 to-transparent pointer-events-none" />

      {/* Real Screen Share Video Track */}
      {isSharing ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocalSharing} // Mute local preview to prevent echo loops
            className="w-full h-full max-h-[calc(100vh-140px)] object-contain select-none"
          />

          {/* Hidden dedicated audio sink for remote screen audio */}
          {!isLocalSharing && (
            <audio ref={audioRef} autoPlay playsInline />
          )}

          {/* Top Stage Bar: Live screen indicator, sharer info and audio indicators */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-2 rounded-full bg-black/75 px-3.5 py-1.5 backdrop-blur-xl border border-white/10 text-xs text-white shadow-xl pointer-events-auto">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#fb7185]" />
              <span className="font-semibold text-rose-300 text-[11px] uppercase tracking-wider">Live Screen</span>
              <span className="text-slate-400">·</span>
              <span className="font-medium text-slate-200">
                {isLocalSharing ? 'You are sharing' : `${sharerName} is sharing`}
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Tab Audio Indicator */}
              <button
                onClick={onOpenAudioHelp}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl border transition-all cursor-pointer ${
                  hasTabAudio
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                }`}
                title="Movie audio status & tips"
              >
                <Radio className="h-3.5 w-3.5" />
                <span>{hasTabAudio ? 'Tab Audio: Active' : 'No Tab Audio'}</span>
                <Info className="h-3 w-3 opacity-70" />
              </button>

              {/* Volume Slider if remote */}
              {!isLocalSharing && hasTabAudio && (
                <div className="flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 backdrop-blur-xl border border-white/10 text-xs text-white">
                  <button onClick={toggleMuteAudio} className="text-slate-300 hover:text-white cursor-pointer">
                    {isAudioMuted || volume === 0 ? (
                      <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isAudioMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-14 sm:w-20 accent-rose-500 h-1 cursor-pointer"
                  />
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-xl border border-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Cozy Waiting State (No screen shared yet) */
        <div className="relative flex flex-col items-center justify-center p-8 text-center max-w-lg z-10 select-none">
          {/* Cinema Screen Illustration */}
          <div className="relative mb-5">
            <div className="w-40 h-28 sm:w-52 sm:h-36 rounded-3xl border-2 border-dashed border-rose-500/35 bg-gradient-to-b from-rose-500/10 via-purple-500/5 to-transparent flex flex-col items-center justify-center shadow-2xl shadow-rose-500/10 backdrop-blur-md group transition-transform">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-500/30 text-rose-400 mb-2">
                <Film className="h-6 w-6 stroke-[1.5]" />
              </div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-rose-300">
                Moonlit Cinema
              </span>
            </div>

            {/* Floating Moon Badge */}
            <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-purple-500 text-white shadow-lg shadow-rose-500/30 animate-pulse">
              <Moon className="h-4 w-4 fill-current" />
            </div>

            <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce">🍿</div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Your movie night starts here
          </h2>

          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-6 font-light">
            Share your favorite movie or show with your person. For full sound, choose your browser tab and enable <strong className="text-rose-300 font-medium">&quot;Also share tab audio&quot;</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {onStartScreenShare && (
              <button
                onClick={onStartScreenShare}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 active:scale-95 transition-all cursor-pointer"
              >
                <ScreenShare className="h-4 w-4" />
                <span>Share Screen Now</span>
              </button>
            )}

            <button
              onClick={onOpenAudioHelp}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs text-rose-200/90 transition-all cursor-pointer"
            >
              <Radio className="h-3.5 w-3.5 text-rose-400" />
              <span>Audio guide</span>
              <Info className="h-3 w-3 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Theater Mode Toggle in Corner */}
      <button
        onClick={onToggleTheaterMode}
        className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/75 hover:bg-black/90 px-3.5 py-1.5 text-xs text-slate-300 hover:text-white border border-white/10 backdrop-blur-xl transition-all shadow-lg cursor-pointer"
        title="Toggle distraction-free theater mode"
      >
        <Tv className="h-3.5 w-3.5 text-rose-400" />
        <span className="hidden sm:inline">
          {isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
        </span>
      </button>
    </div>
  );
}
