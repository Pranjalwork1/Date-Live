import { ThemeConfig, ThemeType } from './types';

export const THEMES: Record<ThemeType, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Deep starry navy, sapphire shadows, and violet aura',
    bgStyle: 'radial-gradient(ellipse at 50% -10%, #172554 0%, #0c1538 40%, #060919 100%)',
    bgGradient: 'from-[#060919] via-[#0c1538] to-[#172554]',
    aura1: 'rgba(59, 130, 246, 0.25)',
    aura2: 'rgba(139, 92, 246, 0.22)',
    aura3: 'rgba(30, 58, 138, 0.28)',
    cardBg: 'rgba(13, 22, 48, 0.82)',
    cardBorder: 'rgba(59, 130, 246, 0.32)',
    accentFrom: '#3b82f6',
    accentTo: '#8b5cf6',
    accent: 'from-blue-500 to-indigo-500',
    accentText: 'text-blue-400',
    accentTextColor: '#60a5fa',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_50px_-10px_rgba(59,130,246,0.35)]',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    dotColor: '#3b82f6',
    particleColor: '#bfdbfe',
  },
  candlelight: {
    id: 'candlelight',
    name: 'Candlelight',
    tagline: 'Warm burgundy, dark rose, and flickering amber glow',
    bgStyle: 'radial-gradient(ellipse at 50% -10%, #4c0519 0%, #290818 40%, #12030a 100%)',
    bgGradient: 'from-[#12030a] via-[#290818] to-[#4c0519]',
    aura1: 'rgba(244, 63, 94, 0.26)',
    aura2: 'rgba(245, 158, 11, 0.26)',
    aura3: 'rgba(225, 29, 72, 0.22)',
    cardBg: 'rgba(38, 10, 24, 0.85)',
    cardBorder: 'rgba(251, 113, 133, 0.35)',
    accentFrom: '#f43f5e',
    accentTo: '#f59e0b',
    accent: 'from-rose-500 to-amber-400',
    accentText: 'text-rose-400',
    accentTextColor: '#fb7185',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_50px_-10px_rgba(244,63,94,0.35)]',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    dotColor: '#f59e0b',
    particleColor: '#fde68a',
  },
  lavender: {
    id: 'lavender',
    name: 'Dreamy',
    tagline: 'Deep purple, ethereal twilight, and soft lavender',
    bgStyle: 'radial-gradient(ellipse at 50% -10%, #3b0764 0%, #1f0b3b 40%, #0b0318 100%)',
    bgGradient: 'from-[#0b0318] via-[#1f0b3b] to-[#3b0764]',
    aura1: 'rgba(168, 85, 247, 0.26)',
    aura2: 'rgba(236, 72, 153, 0.22)',
    aura3: 'rgba(99, 102, 241, 0.2)',
    cardBg: 'rgba(28, 12, 48, 0.85)',
    cardBorder: 'rgba(192, 132, 252, 0.35)',
    accentFrom: '#a855f7',
    accentTo: '#ec4899',
    accent: 'from-purple-500 to-pink-500',
    accentText: 'text-purple-300',
    accentTextColor: '#c084fc',
    border: 'border-purple-400/30',
    glow: 'shadow-[0_0_50px_-10px_rgba(192,132,252,0.35)]',
    glowColor: 'rgba(192, 132, 252, 0.35)',
    dotColor: '#c084fc',
    particleColor: '#fbcfe8',
  },
  cinema: {
    id: 'cinema',
    name: 'Cozy',
    tagline: 'Warm brown, muted plum, and gentle peach atmosphere',
    bgStyle: 'radial-gradient(ellipse at 50% -10%, #381a12 0%, #241310 40%, #110705 100%)',
    bgGradient: 'from-[#110705] via-[#241310] to-[#381a12]',
    aura1: 'rgba(249, 115, 22, 0.24)',
    aura2: 'rgba(217, 119, 6, 0.26)',
    aura3: 'rgba(120, 53, 15, 0.28)',
    cardBg: 'rgba(32, 18, 14, 0.88)',
    cardBorder: 'rgba(251, 146, 60, 0.35)',
    accentFrom: '#f97316',
    accentTo: '#fbbf24',
    accent: 'from-amber-500 to-orange-400',
    accentText: 'text-amber-400',
    accentTextColor: '#fb923c',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_50px_-10px_rgba(249,115,22,0.35)]',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    dotColor: '#f97316',
    particleColor: '#fed7aa',
  },
  // Aliases for seamless interoperability
  dreamy: null as unknown as ThemeConfig,
  cozy: null as unknown as ThemeConfig,
};

// Bind aliases
THEMES.dreamy = THEMES.lavender;
THEMES.cozy = THEMES.cinema;

export const AVAILABLE_MOODS: ThemeType[] = ['midnight', 'candlelight', 'lavender', 'cinema'];

export const normalizeTheme = (t?: string): ThemeType => {
  if (t === 'dreamy' || t === 'lavender') return 'lavender';
  if (t === 'cozy' || t === 'cinema') return 'cinema';
  if (t === 'candlelight') return 'candlelight';
  return 'midnight';
};


export const REACTION_EMOJIS = [
  { emoji: '❤️', label: 'Heart', desc: 'Send love' },
  { emoji: '💕', label: 'Two Hearts', desc: 'Closer together' },
  { emoji: '😍', label: 'Heart Eyes', desc: 'Loving this' },
  { emoji: '🥹', label: 'Emotional', desc: 'So sweet' },
  { emoji: '😘', label: 'Kiss', desc: 'Blow a kiss' },
  { emoji: '😂', label: 'Laugh', desc: 'Too funny' },
  { emoji: '😮', label: 'Wow', desc: 'Plot twist!' },
  { emoji: '👏', label: 'Clap', desc: 'Bravo' },
  { emoji: '✨', label: 'Sparkles', desc: 'Magical moment' },
  { emoji: '🎉', label: 'Celebrate', desc: 'Yay!' },
  { emoji: '🍿', label: 'Popcorn', desc: 'Movie time' },
];
