export type ThemeType = 'midnight' | 'candlelight' | 'lavender' | 'cinema' | 'dreamy' | 'cozy';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  tagline: string;
  bgStyle: string;
  bgGradient: string;
  aura1: string;
  aura2: string;
  aura3: string;
  cardBg: string;
  cardBorder: string;
  accentFrom: string;
  accentTo: string;
  accent: string;
  accentText: string;
  accentTextColor: string;
  border: string;
  glow: string;
  glowColor: string;
  dotColor: string;
  particleColor: string;
}

export interface DateRoom {
  id: string;
  room_code: string;
  title: string;
  host_user_id: string;
  host_name: string;
  theme: ThemeType;
  expires_at: string;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  role: 'host' | 'guest' | 'viewer';
  joined_at: string;
  last_seen_at?: string;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export interface ReactionPayload {
  id: string;
  emoji: string;
  senderName: string;
  senderId: string;
  timestamp: number;
}

export interface ActiveReaction extends ReactionPayload {
  leftPercent: number; // random starting horizontal position
  driftDirection: number; // -1 to 1
}

export interface LiveKitTokenResponse {
  token: string;
  serverUrl: string;
  roomName: string;
  participantIdentity: string;
  participantName: string;
  isMock?: boolean;
}

export type CameraProcessingMode = 'studio-hd' | 'low-light' | 'warm-glow' | 'natural';

export interface CameraProcessingOption {
  id: CameraProcessingMode;
  name: string;
  shortName: string;
  icon: string;
  filterStyle: string;
  description: string;
}

export const CAMERA_PROCESSING_MODES: CameraProcessingOption[] = [
  {
    id: 'studio-hd',
    name: 'Studio HD Clarity',
    shortName: 'Studio HD',
    icon: '✨',
    filterStyle: 'contrast(1.09) brightness(1.06) saturate(1.12)',
    description: 'Crisp facial contours, balanced exposure & rich colors',
  },
  {
    id: 'low-light',
    name: 'Low-Light Boost',
    shortName: 'Night Boost',
    icon: '🌙',
    filterStyle: 'contrast(1.14) brightness(1.24) saturate(1.12)',
    description: 'Brightens faces in dark rooms during movie watching',
  },
  {
    id: 'warm-glow',
    name: 'Romantic Warm Glow',
    shortName: 'Warm Glow',
    icon: '🕯️',
    filterStyle: 'sepia(0.12) saturate(1.18) contrast(1.05) brightness(1.06) hue-rotate(-6deg)',
    description: 'Soft candlelit warmth & flattering romantic mood',
  },
  {
    id: 'natural',
    name: 'Natural (Raw)',
    shortName: 'Natural',
    icon: '🌿',
    filterStyle: 'none',
    description: 'Direct unfiltered camera feed',
  },
];

export type ScreenProcessingMode = 'cinema-true' | 'vivid-crisp' | 'night-cinema' | 'source-pure';

export interface ScreenProcessingOption {
  id: ScreenProcessingMode;
  name: string;
  shortName: string;
  icon: string;
  filterStyle: string;
  description: string;
}

export const SCREEN_PROCESSING_MODES: ScreenProcessingOption[] = [
  {
    id: 'cinema-true',
    name: 'Cinema True Tone',
    shortName: 'Cinema True',
    icon: '🎬',
    filterStyle: 'contrast(1.08) saturate(1.10) brightness(1.02)',
    description: 'Theatrical contrast calibration with rich deep blacks',
  },
  {
    id: 'vivid-crisp',
    name: 'Vivid Ultra Clarity',
    shortName: 'Vivid Crisp',
    icon: '✨',
    filterStyle: 'contrast(1.14) saturate(1.22) brightness(1.04)',
    description: 'High vibrance & razor-sharp definition for animated & colorful films',
  },
  {
    id: 'night-cinema',
    name: 'Night Shadow Boost',
    shortName: 'Shadow Boost',
    icon: '🌙',
    filterStyle: 'brightness(1.15) contrast(1.10) saturate(1.08)',
    description: 'Lifts dark shadow details in low-light scenes without washing out colors',
  },
  {
    id: 'source-pure',
    name: 'Direct Source (Raw)',
    shortName: 'Raw Direct',
    icon: '🎞️',
    filterStyle: 'none',
    description: 'Untouched bit-for-bit raw screen capture feed',
  },
];

