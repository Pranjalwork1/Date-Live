export type ThemeType = 'midnight' | 'candlelight' | 'lavender' | 'cinema';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  tagline: string;
  bgGradient: string;
  cardBg: string;
  accent: string;
  accentText: string;
  border: string;
  glow: string;
  dotColor: string;
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
