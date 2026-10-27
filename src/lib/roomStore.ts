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

export async function generateUniqueRoomCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const code = generateRoomCode();
    const existing = await getRoomByCode(code);
    if (!existing) return code;
    attempts++;
  }
  return `moon-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

export async function createRoom(data: {
  title?: string;
  hostName: string;
  theme?: ThemeType;
  hostUserId?: string;
}): Promise<DateRoom> {
  const roomCode = await generateUniqueRoomCode();
  const hostUserId = data.hostUserId?.trim() || `usr_${Math.random().toString(36).substring(2, 10)}`;
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

export async function isRoomExpired(code: string): Promise<boolean> {
  const cleanCode = code.trim().toLowerCase();
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('date_rooms')
        .select('expires_at')
        .eq('room_code', cleanCode)
        .single();
      if (data) {
        return new Date(data.expires_at).getTime() <= Date.now();
      }
    } catch {
      // safe fallback
    }
  }
  const room = global.__MOONLIT_ROOMS!.get(cleanCode);
  if (room) {
    return new Date(room.expires_at).getTime() <= Date.now();
  }
  return false;
}

export function generateNumericSuffixOptions(
  baseName: string,
  takenNames: Set<string>,
  count = 3
): string[] {
  // Clean base name: strip any existing numeric postfix e.g. "Pranjal-4821", "Pranjal 2", "Pranjal #2"
  const cleanBase = baseName.trim().slice(0, 35).replace(/[-_#\s]*\d+$/, '').trim() || 'Guest';
  const suggestions: string[] = [];

  const tryAdd = (candidate: string) => {
    if (
      suggestions.length < count &&
      !takenNames.has(candidate.toLowerCase()) &&
      !suggestions.includes(candidate)
    ) {
      suggestions.push(candidate);
      return true;
    }
    return false;
  };

  // Generate random numeric suffixes e.g. "Pranjal-4821", "Pranjal-7356", "Pranjal-1904"
  let attempts = 0;
  while (suggestions.length < count && attempts < 300) {
    attempts++;
    const suffix = Math.floor(1000 + Math.random() * 9000);
    tryAdd(`${cleanBase}-${suffix}`);
  }

  // Fallback if 4-digit space is heavily used: try 5-digit random numeric suffixes
  let fallbackAttempts = 0;
  while (suggestions.length < count && fallbackAttempts < 100) {
    fallbackAttempts++;
    const suffix = Math.floor(10000 + Math.random() * 90000);
    tryAdd(`${cleanBase}-${suffix}`);
  }

  return suggestions;
}

export async function checkDisplayNameAvailability(
  roomId: string,
  requestedName: string,
  userId: string,
  hostInfo?: { hostUserId?: string; hostName?: string }
): Promise<{ available: boolean; originalName: string; suggestions?: string[] }> {
  const cleanName = requestedName.trim().slice(0, 50);
  const members = await getRoomMembers(roomId);

  // Other active members in the room (excluding this userId if reconnecting)
  const otherMembers = members.filter((m) => m.user_id !== userId);
  const takenNames = new Set(otherMembers.map((m) => m.display_name.trim().toLowerCase()));

  // Ensure host display name is checked if host hasn't joined room_members yet
  if (hostInfo?.hostName && hostInfo?.hostUserId && hostInfo.hostUserId !== userId) {
    takenNames.add(hostInfo.hostName.trim().toLowerCase());
  }

  if (!takenNames.has(cleanName.toLowerCase())) {
    return { available: true, originalName: cleanName };
  }

  const suggestions = generateNumericSuffixOptions(cleanName, takenNames, 3);
  return { available: false, originalName: cleanName, suggestions };
}

export async function addRoomMember(
  roomId: string,
  user: {
    userId: string;
    displayName: string;
    role: 'host' | 'guest';
  },
  hostInfo?: { hostUserId?: string; hostName?: string }
): Promise<{ member?: RoomMember; nameTaken?: boolean; suggestions?: string[] }> {
  const cleanName = user.displayName.trim().slice(0, 50);
  const check = await checkDisplayNameAvailability(roomId, cleanName, user.userId, hostInfo);
  if (!check.available) {
    return {
      nameTaken: true,
      suggestions: check.suggestions,
    };
  }

  const member: RoomMember = {
    id: `mem_${Math.random().toString(36).substring(2, 10)}`,
    room_id: roomId,
    user_id: user.userId,
    display_name: cleanName,
    role: user.role,
    joined_at: new Date().toISOString(),
  };

  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      // Re-verify immediately before write to prevent simultaneous collision
      const { data: currentMembers } = await supabase
        .from('room_members')
        .select('user_id, display_name')
        .eq('room_id', roomId);

      const isConflict = currentMembers?.some(
        (m) =>
          m.user_id !== user.userId &&
          m.display_name.trim().toLowerCase() === cleanName.toLowerCase()
      );

      if (isConflict) {
        const taken = new Set(
          (currentMembers || [])
            .filter((m) => m.user_id !== user.userId)
            .map((m) => m.display_name.trim().toLowerCase())
        );
        if (hostInfo?.hostName && hostInfo?.hostUserId && hostInfo.hostUserId !== user.userId) {
          taken.add(hostInfo.hostName.trim().toLowerCase());
        }
        return {
          nameTaken: true,
          suggestions: generateNumericSuffixOptions(cleanName, taken, 3),
        };
      }

      await supabase.from('room_members').upsert(
        {
          room_id: roomId,
          user_id: user.userId,
          display_name: cleanName,
          role: user.role,
        },
        { onConflict: 'room_id,user_id' }
      );
      return { member };
    } catch (e) {
      console.warn('Supabase member upsert error:', e);
    }
  }

  const existing = global.__MOONLIT_MEMBERS!.get(roomId) || [];
  const inMemConflict = existing.some(
    (m) =>
      m.user_id !== user.userId &&
      m.display_name.trim().toLowerCase() === cleanName.toLowerCase()
  );
  if (inMemConflict) {
    const taken = new Set(
      existing
        .filter((m) => m.user_id !== user.userId)
        .map((m) => m.display_name.trim().toLowerCase())
    );
    if (hostInfo?.hostName && hostInfo?.hostUserId && hostInfo.hostUserId !== user.userId) {
      taken.add(hostInfo.hostName.trim().toLowerCase());
    }
    return {
      nameTaken: true,
      suggestions: generateNumericSuffixOptions(cleanName, taken, 3),
    };
  }

  const filtered = existing.filter((m) => m.user_id !== user.userId);
  filtered.push(member);
  global.__MOONLIT_MEMBERS!.set(roomId, filtered);

  return { member };
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      if (!error && data) {
        return data as RoomMember[];
      }
    } catch (e) {
      console.warn('Supabase getRoomMembers error:', e);
    }
  }

  return global.__MOONLIT_MEMBERS!.get(roomId) || [];
}

export async function isRoomMember(roomId: string, userId: string): Promise<boolean> {
  if (!roomId || !userId) return false;
  const members = await getRoomMembers(roomId);
  return members.some((m) => m.user_id === userId);
}

export async function removeRoomMember(roomId: string, userId: string): Promise<void> {
  if (!roomId || !userId) return;
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      await supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase member remove error:', e);
    }
  }

  const existing = global.__MOONLIT_MEMBERS!.get(roomId);
  if (existing) {
    global.__MOONLIT_MEMBERS!.set(
      roomId,
      existing.filter((m) => m.user_id !== userId)
    );
  }
}

export async function updateRoomTheme(roomId: string, theme: ThemeType): Promise<boolean> {
  if (!roomId || !theme) return false;
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('date_rooms')
        .update({ theme })
        .eq('id', roomId);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase updateRoomTheme error:', e);
    }
  }

  // Update in-memory store
  for (const [, room] of global.__MOONLIT_ROOMS!.entries()) {
    if (room.id === roomId) {
      room.theme = theme;
      return true;
    }
  }
  return false;
}

export async function deleteRoom(
  roomCode: string,
  requesterUserId: string
): Promise<{ success: boolean; error?: string }> {
  if (!roomCode || !requesterUserId) {
    return { success: false, error: 'Missing roomCode or requesterUserId' };
  }

  const cleanCode = roomCode.trim().toLowerCase();
  const room = await getRoomByCode(cleanCode);
  if (!room) {
    return { success: false, error: 'Room not found or already deleted' };
  }

  // Strictly verify host ownership on server
  if (room.host_user_id !== requesterUserId.trim()) {
    return {
      success: false,
      error: 'Unauthorized: Only the room host can delete this room',
    };
  }

  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      // 1. Delete associated messages
      await supabase
        .from('room_messages')
        .delete()
        .eq('room_id', room.id);

      // 2. Delete associated members
      await supabase
        .from('room_members')
        .delete()
        .eq('room_id', room.id);

      // 3. Delete the date room itself
      const { error: deleteError } = await supabase
        .from('date_rooms')
        .delete()
        .eq('id', room.id);

      if (deleteError) {
        console.warn('Supabase delete error on date_rooms:', deleteError);
      }
    } catch (e) {
      console.warn('Supabase deleteRoom error:', e);
    }
  }

  // Also remove from in-memory fallback stores completely
  global.__MOONLIT_ROOMS!.delete(cleanCode);
  global.__MOONLIT_MEMBERS!.delete(room.id);
  global.__MOONLIT_MESSAGES!.delete(room.id);

  return { success: true };
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
