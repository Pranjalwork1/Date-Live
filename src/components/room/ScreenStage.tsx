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
  Sparkles,
} from 'lucide-react';
import { ThemeType, CameraProcessingMode, CAMERA_PROCESSING_MODES } from '@/lib/types';
import { THEMES, normalizeTheme } from '@/lib/themes';
import { ParticipantState } from './ParticipantPanel';

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
  onOpenInvite?: () => void;
  participantCount?: number;
  spotlightParticipant?: ParticipantState | null;
  onClearSpotlight?: () => void;
  cameraProcessingMode?: CameraProcessingMode;
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
  onOpenInvite,
  participantCount = 1,
  spotlightParticipant,
  onClearSpotlight,
  cameraProcessingMode = 'studio-hd',
}: ScreenStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const spotlightVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isAudioMuted, setIsAudioMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(1);

  // Attach screen share video stream
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

  // Attach spotlight camera video stream
  useEffect(() => {
    const videoEl = spotlightVideoRef.current;
    if (videoEl) {
      if (spotlightParticipant?.cameraStream) {
        videoEl.srcObject = spotlightParticipant.cameraStream;
        videoEl.play().catch((err) => {
          console.warn('Spotlight camera video play error:', err);
        });
      } else {
        videoEl.srcObject = null;
      }
    }
    return () => {
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [spotlightParticipant?.cameraStream]);

  // Attach separate screen audio stream if remote
  useEffect(() => {
    if (audioRef.current) {
      if (audioStream && !isLocalSharing) {
        audioRef.current.srcObject = audioStream;
        audioRef.current.volume = volume;
        audioRef.current.muted = isAudioMuted;
        audioRef.current.play().catch((err) => {
          console.warn('Screen audio playback interrupted:', err);
        });
      } else {
        audioRef.current.srcObject = null;
      }
    }
  }, [audioStream, isLocalSharing, volume, isAudioMuted]);

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

  const currentTheme = THEMES[normalizeTheme(theme)] || THEMES.midnight;
  const activeProcessing =
    CAMERA_PROCESSING_MODES.find((m) => m.id === cameraProcessingMode) || CAMERA_PROCESSING_MODES[0];

  const hasActiveSpotlight = Boolean(
    !isSharing && spotlightParticipant && spotlightParticipant.isCameraOn && spotlightParticipant.cameraStream
  );

  return (
    <div
      ref={containerRef}
      className="relative flex-1 flex flex-col items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl backdrop-blur-xl transition-all duration-500 w-full aspect-video min-h-[200px] sm:min-h-[340px] lg:min-h-[420px]"
      style={{
        backgroundColor: currentTheme.cardBg,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: isSharing
          ? 'rgba(244,63,94,0.55)'
          : hasActiveSpotlight
          ? 'rgba(168,85,247,0.55)'
          : currentTheme.cardBorder,
        boxShadow: isSharing
          ? `0 0 0 1px rgba(244,63,94,0.2), 0 20px 60px -15px rgba(0,0,0,0.95), 0 0 40px -5px rgba(244,63,94,0.35)`
          : hasActiveSpotlight
          ? `0 0 0 1px rgba(168,85,247,0.2), 0 20px 60px -15px rgba(0,0,0,0.95), 0 0 40px -5px rgba(168,85,247,0.35)`
          : `0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px -8px ${currentTheme.glowColor}`,
      }}
    >
      {/* Soft dynamic radial aura behind video stage */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${currentTheme.aura1} 0%, ${currentTheme.aura2} 45%, transparent 75%)`,
        }}
      />

      {/* 1. Real Screen Share Video Track */}
      {isSharing ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocalSharing}
            className="w-full h-full max-h-[calc(100vh-140px)] object-contain select-none"
          />

          {/* Hidden dedicated audio sink for remote screen audio */}
          {!isLocalSharing && (
            <audio ref={audioRef} autoPlay playsInline />
          )}

          {/* Top Stage Bar: Live screen indicator, sharer info and audio indicators */}
          <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 sm:px-3.5 py-1 sm:py-1.5 backdrop-blur-xl border border-white/10 text-xs text-white shadow-xl pointer-events-auto">
              <span
                className="flex h-2 w-2 rounded-full animate-pulse shadow-sm shrink-0"
                style={{ backgroundColor: '#f43f5e', boxShadow: '0 0 8px rgba(244,63,94,0.8)' }}
              />
              <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider text-rose-300">
                Live Screen
              </span>
              <span className="hidden sm:inline text-slate-400">·</span>
              <span className="hidden sm:inline font-medium text-slate-200 text-[11px] truncate max-w-[120px]">
                {isLocalSharing ? 'You are sharing' : `${sharerName} is sharing`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* Tab Audio Indicator - hidden on xs, shown sm+ */}
              <button
                onClick={onOpenAudioHelp}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl border transition-all cursor-pointer ${
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

              {/* Compact audio icon on mobile */}
              <button
                onClick={onOpenAudioHelp}
                className={`flex sm:hidden items-center justify-center h-7 w-7 rounded-full backdrop-blur-xl border transition-all cursor-pointer ${
                  hasTabAudio
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                }`}
                title="Movie audio status & tips"
              >
                <Radio className="h-3.5 w-3.5" />
              </button>

              {/* Volume Slider if remote */}
              {!isLocalSharing && hasTabAudio && (
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 backdrop-blur-xl border border-white/10 text-xs text-white">
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

              {/* Fullscreen Button — bigger tap target on mobile */}
              <button
                onClick={toggleFullscreen}
                className="flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/15 text-slate-200 hover:text-white transition-colors cursor-pointer shadow-lg"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      ) : hasActiveSpotlight ? (
        /* 2. Spotlight Camera Video Stage */
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={spotlightVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full max-h-[calc(100vh-140px)] object-cover sm:object-contain select-none"
            style={{
              filter: activeProcessing.filterStyle,
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              willChange: 'transform, filter',
            }}
          />

          {/* Top Spotlight Bar */}
          <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 sm:px-3.5 py-1 sm:py-1.5 backdrop-blur-xl border border-white/10 text-xs text-white shadow-xl pointer-events-auto">
              <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse shadow-sm shrink-0" />
              <span className="font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider text-purple-300">
                Camera Spotlight
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-medium text-slate-200 text-[11px] truncate max-w-[140px]">
                {spotlightParticipant?.displayName}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/25 border border-purple-500/40 text-purple-200 text-[9px] font-semibold">
                HD 720p
              </span>
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* Active Camera Processing badge */}
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 border border-white/10 text-[11px] text-rose-300 backdrop-blur-xl">
                <Sparkles className="h-3 w-3" />
                <span>{activeProcessing.name}</span>
              </div>

              {/* Exit Spotlight button */}
              {onClearSpotlight && (
                <button
                  onClick={onClearSpotlight}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/80 hover:bg-black/95 text-xs text-slate-200 hover:text-white border border-white/15 backdrop-blur-xl transition-all cursor-pointer shadow-lg"
                  title="Exit camera spotlight"
                >
                  <Minimize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Exit Spotlight</span>
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="flex items-center justify-center h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/15 text-slate-200 hover:text-white transition-colors cursor-pointer shadow-lg"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Cozy Waiting State (No screen shared yet, standby cinema) */
        <div className="relative flex flex-col items-center justify-center p-4 sm:p-8 text-center max-w-lg z-10 select-none">
          {/* Cinema Screen Illustration */}
          <div className="relative mb-4 sm:mb-5">
            <div
              className="w-32 h-24 sm:w-52 sm:h-36 rounded-2xl sm:rounded-3xl border-2 border-dashed flex flex-col items-center justify-center shadow-2xl backdrop-blur-md group transition-all duration-500"
              style={{
                borderColor: currentTheme.cardBorder,
                background: `radial-gradient(circle at 50% 50%, ${currentTheme.aura1} 0%, transparent 80%)`,
                boxShadow: `0 20px 40px -10px ${currentTheme.glowColor}`,
              }}
            >
              <div
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border mb-1 sm:mb-2 transition-all duration-500"
                style={{
                  borderColor: currentTheme.cardBorder,
                  background: `linear-gradient(135deg, ${currentTheme.aura1}, ${currentTheme.aura2})`,
                  color: currentTheme.accentTextColor,
                }}
              >
                <Film className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.5]" />
              </div>
              <span
                className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase"
                style={{ color: currentTheme.accentTextColor }}
              >
                Moonlit Cinema
              </span>
            </div>

            {/* Floating Moon Badge */}
            <div
              className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-white shadow-lg animate-pulse transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.accentFrom}, ${currentTheme.accentTo})`,
                boxShadow: `0 4px 14px ${currentTheme.glowColor}`,
              }}
            >
              <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
            </div>

            <div className="absolute -bottom-2 -left-2 text-xl sm:text-2xl animate-bounce">🍿</div>
          </div>

          {participantCount < 2 ? (
            <>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Your movie night is waiting 🌙
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-5 sm:mb-6 font-light max-w-sm">
                Invite your person to start watching together. You can share your screen, movie sound, and talk freely with HD camera clarity.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                {onOpenInvite && (
                  <button
                    onClick={onOpenInvite}
                    className="flex items-center justify-center gap-2 rounded-full w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${currentTheme.accentFrom}, ${currentTheme.accentTo})`,
                      boxShadow: `0 10px 25px -5px ${currentTheme.glowColor}`,
                    }}
                  >
                    <span>Invite ❤️</span>
                  </button>
                )}
                {onStartScreenShare && (
                  <button
                    onClick={onStartScreenShare}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white shadow transition-all active:scale-95 cursor-pointer"
                  >
                    <ScreenShare className="h-4 w-4" style={{ color: currentTheme.accentTextColor }} />
                    <span>Share Screen</span>
                  </button>
                )}
                <button
                  onClick={onOpenAudioHelp}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 w-full sm:w-auto px-4 py-2.5 text-xs text-rose-200/90 transition-all cursor-pointer"
                >
                  <Radio className="h-3.5 w-3.5 text-rose-400" />
                  <span>Audio guide</span>
                  <Info className="h-3 w-3 text-slate-400" />
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Your movie night starts here
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-5 sm:mb-6 font-light max-w-sm">
                Share your favorite movie or show with your person. For full sound, choose your browser tab and enable <strong className="text-rose-300 font-medium">&quot;Also share tab audio&quot;</strong>.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                {onStartScreenShare && (
                  <button
                    onClick={onStartScreenShare}
                    className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <ScreenShare className="h-4 w-4" />
                    <span>Share Screen Now</span>
                  </button>
                )}
                {onOpenInvite && (
                  <button
                    onClick={onOpenInvite}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 w-full sm:w-auto px-4 py-2.5 text-xs text-rose-300 font-medium transition-all cursor-pointer"
                  >
                    <span>Invite Link ❤️</span>
                  </button>
                )}
                <button
                  onClick={onOpenAudioHelp}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 w-full sm:w-auto px-4 py-2.5 text-xs text-rose-200/90 transition-all cursor-pointer"
                >
                  <Radio className="h-3.5 w-3.5 text-rose-400" />
                  <span>Audio guide</span>
                  <Info className="h-3 w-3 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Theater Mode Toggle in Corner */}
      <button
        onClick={onToggleTheaterMode}
        className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/80 hover:bg-black/95 px-2.5 sm:px-3.5 py-1.5 text-xs text-slate-300 hover:text-white border border-white/10 backdrop-blur-xl transition-all shadow-lg cursor-pointer"
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
