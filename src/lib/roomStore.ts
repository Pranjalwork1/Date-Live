import { DateRoom, RoomMember, RoomMessage, ThemeType } from './types';
import { getSupabaseServer } from './supabase';

// In-memory fallback store for development/demo when Supabase is not configured
declare global {
  var __MOONLIT_ROOMS: Map<string, DateRoom> | undefined;
  var __MOONLIT_MEMBERS: Map<string, RoomMember[]> | undefined;
  var __MOONLIT_MESSAGES: Map<string, RoomMessage[]> | undefined;
}

if (!global.__MOONLIT_ROOMS) {
  global.__MOONLIT_ROOMS = new Map<string, DateRoom>();
}
if (!global.__MOONLIT_MEMBERS) {
  global.__MOONLIT_MEMBERS = new Map<string, RoomMember[]>();
}
if (!global.__MOONLIT_MESSAGES) {
  global.__MOONLIT_MESSAGES = new Map<string, RoomMessage[]>();
}

export function generateRoomCode(): string {
  // Generate a hard-to-guess, romantic, slug-like invitation code (e.g. moon-7x9q-2a8d)
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `moon-${part1}-${part2}`;
}

export async function createRoom(data: {
  title?: string;
  hostName: string;
  theme?: ThemeType;
}): Promise<DateRoom> {
  const roomCode = generateRoomCode();
  const hostUserId = `usr_${Math.random().toString(36).substring(2, 10)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const title = (data.title || '').trim() || 'Our Movie Night';
  const theme: ThemeType = data.theme || 'midnight';

  const room: DateRoom = {
    id: `rm_${Math.random().toString(36).substring(2, 12)}`,
    room_code: roomCode,
    title,
    host_user_id: hostUserId,
    host_name: data.hostName.trim() || 'Host',
    theme,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { data: dbRoom, error } = await supabase
        .from('date_rooms')
        .insert({
          room_code: room.room_code,
          title: room.title,
          host_user_id: room.host_user_id,
          host_name: room.host_name,
          theme: room.theme,
          expires_at: room.expires_at,
        })
        .select()
        .single();

      if (!error && dbRoom) {
        // Also insert host member
        await supabase.from('room_members').insert({
          room_id: dbRoom.id,
          user_id: room.host_user_id,
          display_name: room.host_name,
          role: 'host',
        });
        return {
          id: dbRoom.id,
          room_code: dbRoom.room_code,
          title: dbRoom.title,
          host_user_id: dbRoom.host_user_id,
          host_name: dbRoom.host_name,
          theme: dbRoom.theme as ThemeType,
          expires_at: dbRoom.expires_at,
          created_at: dbRoom.created_at,
        };
      }
    } catch (e) {
      console.warn('Supabase insert failed, using fallback memory store:', e);
    }
  }

  // Fallback in-memory save
  global.__MOONLIT_ROOMS!.set(roomCode, room);
  global.__MOONLIT_MEMBERS!.set(room.id, [
    {
      id: `mem_${Math.random().toString(36).substring(2, 10)}`,
      room_id: room.id,
      user_id: room.host_user_id,
      display_name: room.host_name,
      role: 'host',
      joined_at: new Date().toISOString(),
    },
  ]);
  global.__MOONLIT_MESSAGES!.set(room.id, []);

  return room;
}

export async function getRoomByCode(code: string): Promise<DateRoom | null> {
  const cleanCode = code.trim().toLowerCase();
  const supabase = getSupabaseServer();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('date_rooms')
        .select('*')
        .eq('room_code', cleanCode)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!error && data) {
        return {
          id: data.id,
          room_code: data.room_code,
          title: data.title,
          host_user_id: data.host_user_id,
          host_name: data.host_name,
          theme: data.theme as ThemeType,
          expires_at: data.expires_at,
          created_at: data.created_at,
        };
      }
    } catch (e) {
      console.warn('Supabase lookup failed, falling back:', e);
    }
  }

  // Fallback lookup
  const room = global.__MOONLIT_ROOMS!.get(cleanCode);
  if (!room) return null;

  // Check expiration
  if (new Date(room.expires_at).getTime() < Date.now()) {
    global.__MOONLIT_ROOMS!.delete(cleanCode);
    return null;
  }

  return room;
}

export async function addRoomMember(roomId: string, user: {
  userId: string;
  displayName: string;
  role: 'host' | 'guest';
}): Promise<RoomMember> {
  const member: RoomMember = {
    id: `mem_${Math.random().toString(36).substring(2, 10)}`,
    room_id: roomId,
    user_id: user.userId,
    display_name: user.displayName,
    role: user.role,
    joined_at: new Date().toISOString(),
  };

  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      await supabase.from('room_members').upsert({
        room_id: roomId,
        user_id: user.userId,
        display_name: user.displayName,
        role: user.role,
      });
      return member;
    } catch (e) {
      console.warn('Supabase member upsert error:', e);
    }
  }

  const existing = global.__MOONLIT_MEMBERS!.get(roomId) || [];
  const filtered = existing.filter((m) => m.user_id !== user.userId);
  filtered.push(member);
  global.__MOONLIT_MEMBERS!.set(roomId, filtered);

  return member;
}

export async function getRoomMessages(roomId: string): Promise<RoomMessage[]> {
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        return data as RoomMessage[];
      }
    } catch (e) {
      console.warn('Supabase messages error:', e);
    }
  }

  return global.__MOONLIT_MESSAGES!.get(roomId) || [];
}

export async function addRoomMessage(roomId: string, message: {
  senderId: string;
  senderName: string;
  content: string;
}): Promise<RoomMessage> {
  const cleanContent = message.content.trim().slice(0, 2000);
  const msg: RoomMessage = {
    id: `msg_${Math.random().toString(36).substring(2, 10)}`,
    room_id: roomId,
    sender_id: message.senderId,
    sender_name: message.senderName,
    content: cleanContent,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('room_messages')
        .insert({
          room_id: roomId,
          sender_id: message.senderId,
          sender_name: message.senderName,
          content: cleanContent,
        })
        .select()
        .single();

      if (!error && data) {
        return data as RoomMessage;
      }
    } catch (e) {
      console.warn('Supabase post message error:', e);
    }
  }

  const existing = global.__MOONLIT_MESSAGES!.get(roomId) || [];
  existing.push(msg);
  global.__MOONLIT_MESSAGES!.set(roomId, existing);

  return msg;
}
