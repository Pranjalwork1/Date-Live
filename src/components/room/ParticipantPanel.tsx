'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Crown,
  ScreenShare,
  VideoOff,
  SwitchCamera,
  Sparkles,
  Maximize2,
  Minimize2,
  Check,
} from 'lucide-react';
import { ThemeType, CameraProcessingMode, CAMERA_PROCESSING_MODES } from '@/lib/types';
import { THEMES, normalizeTheme } from '@/lib/themes';

export interface ParticipantState {
  userId: string;
  displayName: string;
  isHost: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isSharingScreen: boolean;
  isCameraOn: boolean;
  status: 'live' | 'offline' | 'reconnecting';
  cameraStream?: MediaStream | null;
}

interface ParticipantPanelProps {
  participants: ParticipantState[];
  currentUserId: string;
  theme?: ThemeType;
  onOpenInvite?: () => void;
  onFlipCamera?: () => void;
  cameraFacingMode?: 'user' | 'environment';
  processingMode?: CameraProcessingMode;
  onChangeProcessingMode?: (mode: CameraProcessingMode) => void;
  spotlightUserId?: string | null;
  onToggleSpotlight?: (userId: string) => void;
}

function LiveCameraTile({
  stream,
  isSelf,
  facingMode = 'user',
  processingMode = 'studio-hd',
}: {
  stream: MediaStream;
  isSelf: boolean;
  facingMode?: 'user' | 'environment';
  processingMode?: CameraProcessingMode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && stream) {
      videoEl.srcObject = stream;
      videoEl.play().catch((err) => {
        console.warn('Camera video play error:', err);
      });
    }
    return () => {
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [stream]);

  const shouldMirror = isSelf && facingMode === 'user';
  const activeOption =
    CAMERA_PROCESSING_MODES.find((m) => m.id === processingMode) || CAMERA_PROCESSING_MODES[0];

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isSelf}
      className="w-full h-full object-cover rounded-2xl transition-all duration-300 select-none pointer-events-none"
      style={{
        filter: activeOption.filterStyle,
        transform: shouldMirror ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)',
        WebkitTransform: shouldMirror ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform, filter',
      }}
    />
  );
}

export default function ParticipantPanel({
  participants,
  currentUserId,
  theme = 'midnight',
  onOpenInvite,
  onFlipCamera,
  cameraFacingMode = 'user',
  processingMode = 'studio-hd',
  onChangeProcessingMode,
  spotlightUserId,
  onToggleSpotlight,
}: ParticipantPanelProps) {
  const activeTheme = THEMES[normalizeTheme(theme)] || THEMES.midnight;
  const activeCount = participants.filter((p) => p.status === 'live').length;
  const [isEnhanceMenuOpen, setIsEnhanceMenuOpen] = useState(false);

  // Place remote participants (partner/guests) first, and self at the end
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.userId === currentUserId) return 1;
    if (b.userId === currentUserId) return -1;
    return 0;
  });

  const activeProcessing =
    CAMERA_PROCESSING_MODES.find((m) => m.id === processingMode) || CAMERA_PROCESSING_MODES[0];

  return (
    <div className="flex flex-col gap-2 w-full lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-1">
      {/* Grid of participant tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 w-full">
        {sortedParticipants.map((p) => {
          const isSelf = p.userId === currentUserId;
          const isLive = p.status === 'live';
          const isReconnecting = p.status === 'reconnecting';
          const isOffline = p.status === 'offline';
          const hasActiveCamera = Boolean(isLive && p.isCameraOn && p.cameraStream);
          const isSpotlighted = spotlightUserId === p.userId;

          const initials = (p.displayName || 'Guest')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <div
              key={p.userId}
              className={`relative flex flex-col justify-between rounded-2xl border transition-all overflow-hidden w-full aspect-[4/3] sm:aspect-video lg:aspect-video min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] ${
                hasActiveCamera ? 'bg-black shadow-2xl' : 'p-2.5 sm:p-3'
              } ${
                isSpotlighted
                  ? 'border-purple-400 ring-2 ring-purple-400/50 shadow-[0_0_25px_-3px_rgba(168,85,247,0.45)]'
                  : isLive && p.isSpeaking
                  ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_-3px_rgba(52,211,153,0.35)]'
                  : isOffline
                  ? 'border-white/5 bg-black/40 opacity-60 backdrop-blur-md'
                  : isReconnecting
                  ? 'border-amber-500/40 bg-amber-500/10 backdrop-blur-xl'
                  : 'backdrop-blur-xl shadow-lg'
              }`}
              style={
                !hasActiveCamera && !isOffline && !isReconnecting && !(isLive && p.isSpeaking) && !isSpotlighted
                  ? {
                      backgroundColor: activeTheme.cardBg,
                      borderColor: activeTheme.cardBorder,
                      background: `radial-gradient(circle at 50% 40%, ${activeTheme.aura1} 0%, ${activeTheme.cardBg} 85%)`,
                    }
                  : undefined
              }
            >
              {hasActiveCamera ? (
                /* LIVE CAMERA VIDEO TILE */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <LiveCameraTile
                    stream={p.cameraStream!}
                    isSelf={isSelf}
                    facingMode={isSelf ? cameraFacingMode : 'user'}
                    processingMode={processingMode}
                  />

                  {/* Overlays on Camera Tile */}
                  <div className="absolute inset-0 pointer-events-none p-2 sm:p-2.5 flex flex-col justify-between bg-gradient-to-t from-black/85 via-transparent to-black/50">
                    {/* Top row badges & action controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.isHost && (
                          <span
                            className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black shadow-sm shrink-0"
                            title="Room Host"
                          >
                            <Crown className="h-2.5 w-2.5 fill-current" />
                          </span>
                        )}
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold backdrop-blur-md shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Live</span>
                        </span>
                        <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[9px] font-medium backdrop-blur-md shrink-0">
                          HD 720p
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Camera Processing / Optimization toggle button */}
                        {onChangeProcessingMode && (
                          <div className="relative pointer-events-auto">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEnhanceMenuOpen((prev) => !prev);
                              }}
                              className={`touch-manipulation flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full backdrop-blur-md shadow-lg transition-all cursor-pointer border ${
                                processingMode !== 'natural'
                                  ? 'bg-rose-500/30 border-rose-400/60 text-rose-200 hover:bg-rose-500/50'
                                  : 'bg-black/75 border-white/20 text-slate-300 hover:bg-black/90 hover:text-white'
                              }`}
                              title={`Camera Optimization: ${activeProcessing.name} (click to adjust)`}
                              aria-label="Adjust camera optimization filter"
                            >
                              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>

                            {/* Dropdown menu for camera processing */}
                            {isEnhanceMenuOpen && (
                              <div
                                className="absolute right-0 top-9 z-50 w-56 rounded-2xl border border-white/20 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-2 py-1 mb-1 border-b border-white/10 flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    <span>Camera Processing</span>
                                  </span>
                                  <span className="text-[9px] text-slate-400">HD Clarity</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {CAMERA_PROCESSING_MODES.map((option) => {
                                    const isSelected = processingMode === option.id;
                                    return (
                                      <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => {
                                          onChangeProcessingMode(option.id);
                                          setIsEnhanceMenuOpen(false);
                                        }}
                                        className={`flex items-start gap-2 px-2 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                                            : 'hover:bg-white/10 text-slate-300 border border-transparent'
                                        }`}
                                      >
                                        <span className="text-sm shrink-0 mt-0.5">{option.icon}</span>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold leading-none truncate">
                                              {option.name}
                                            </span>
                                            {isSelected && (
                                              <Check className="h-3 w-3 text-rose-400 shrink-0 ml-1" />
                                            )}
                                          </div>
                                          <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                                            {option.description}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Spotlight to Stage button */}
                        {onToggleSpotlight && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSpotlight(p.userId);
                            }}
                            className={`pointer-events-auto touch-manipulation flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full backdrop-blur-md shadow-lg transition-all cursor-pointer border ${
                              isSpotlighted
                                ? 'bg-purple-600 border-purple-400 text-white shadow-purple-500/30'
                                : 'bg-black/75 hover:bg-black/90 text-white border-white/20 hover:border-white/50'
                            }`}
                            title={isSpotlighted ? 'Exit Spotlight' : 'Spotlight on Cinema Stage'}
                            aria-label={isSpotlighted ? 'Exit Spotlight' : 'Spotlight on Stage'}
                          >
                            {isSpotlighted ? (
                              <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            ) : (
                              <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            )}
                          </button>
                        )}

                        {/* Top-Right Camera Flip button for selfie/back camera switch */}
                        {isSelf && onFlipCamera && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFlipCamera();
                            }}
                            className="pointer-events-auto touch-manipulation flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/75 hover:bg-black/90 active:scale-90 text-white border border-white/30 hover:border-white/60 backdrop-blur-md shadow-lg transition-all cursor-pointer ring-0 hover:ring-2 hover:ring-rose-400/50"
                            title={`Switch to ${cameraFacingMode === 'user' ? 'back' : 'selfie'} camera`}
                            aria-label="Switch between selfie and back camera"
                          >
                            <SwitchCamera className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                          </button>
                        )}

                        {p.isSharingScreen && (
                          <span
                            className="p-1 rounded-full bg-rose-500/80 text-white shadow backdrop-blur-md"
                            title="Sharing screen"
                          >
                            <ScreenShare className="h-3 w-3" />
                          </span>
                        )}
                        <span
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow backdrop-blur-md ${
                            p.isMuted
                              ? 'bg-rose-500/85 text-white'
                              : 'bg-emerald-500/85 text-white'
                          }`}
                          title={p.isMuted ? 'Muted' : 'Mic on'}
                        >
                          {p.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                          <span className="hidden sm:inline text-[9px]">
                            {p.isMuted ? 'Muted' : 'Mic on'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: Display Name & Active Processing Filter pill */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] sm:text-xs font-semibold text-white px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-md truncate max-w-[70%] border border-white/10 shadow-sm">
                        {p.displayName} {isSelf && <span className="text-slate-300 font-normal">(You)</span>}
                      </span>
                      <span className="text-[9px] text-rose-300/90 font-medium px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 shrink-0">
                        {activeProcessing.icon} {activeProcessing.shortName}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* CAMERA OFF / SLEEK AVATAR TILE */
                <div className="relative w-full h-full flex flex-col justify-between">
                  {/* Top badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {p.isHost && (
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black shadow-sm shrink-0"
                          title="Room Host"
                        >
                          <Crown className="h-2.5 w-2.5 fill-current" />
                        </span>
                      )}
                      {isLive && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Live</span>
                        </span>
                      )}
                      {isReconnecting && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium shrink-0 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          <span>Reconnecting</span>
                        </span>
                      )}
                      {isOffline && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-slate-400 text-[10px] font-medium shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          <span>Left</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {p.isSharingScreen && (
                        <span
                          className="p-1 rounded-full bg-rose-500/80 text-white shadow"
                          title="Sharing screen"
                        >
                          <ScreenShare className="h-3 w-3" />
                        </span>
                      )}
                      <span
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium shadow ${
                          p.isMuted ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/80 text-white'
                        }`}
                        title={p.isMuted ? 'Muted' : 'Mic on'}
                      >
                        {p.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                        <span className="hidden sm:inline text-[9px]">
                          {p.isMuted ? 'Muted' : 'Mic on'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Center Avatar silhouette / initials */}
                  <div className="flex flex-col items-center justify-center my-auto py-1">
                    <div className="relative">
                      <div
                        className={`relative flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full text-sm sm:text-base font-bold text-white shadow-lg transition-all ${
                          isOffline
                            ? 'bg-slate-700/80 text-slate-300'
                            : p.isHost
                            ? 'bg-gradient-to-tr from-rose-500 to-pink-500 ring-2 ring-rose-400/30'
                            : 'bg-gradient-to-tr from-purple-500 to-indigo-500 ring-2 ring-purple-400/30'
                        }`}
                      >
                        {initials}
                      </div>

                      {/* Speaking pulse ring */}
                      {isLive && p.isSpeaking && (
                        <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <VideoOff className="h-2.5 w-2.5" />
                      <span>Cam off</span>
                    </span>
                  </div>

                  {/* Bottom Display Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-white px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md truncate max-w-[85%] border border-white/10">
                      {p.displayName} {isSelf && <span className="text-slate-300 font-normal">(You)</span>}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Waiting for partner tile if only 1 participant */}
        {activeCount < 2 && !participants.some((p) => p.userId !== currentUserId && p.status === 'live') && (
          <div className="relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-rose-500/30 bg-rose-500/5 aspect-[4/3] sm:aspect-video lg:aspect-video min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] text-center backdrop-blur-md group hover:border-rose-500/50 transition-all">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-dashed border-rose-400/40 text-rose-400 text-lg mb-1 animate-pulse">
              💌
            </div>
            <span className="text-xs font-semibold text-rose-200">Waiting for partner</span>
            <span className="text-[10px] text-slate-400 mb-2">Invite them to watch together</span>
            {onOpenInvite && (
              <button
                onClick={onOpenInvite}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Invite ❤️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
