import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode, addRoomMember } from '@/lib/roomStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, displayName, userId } = body;

    if (!roomCode || typeof roomCode !== 'string') {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
      return NextResponse.json({ error: 'Display name required' }, { status: 400 });
    }

    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json(
        { error: 'This room invitation is invalid or has expired' },
        { status: 404 }
      );
    }

    const cleanName = displayName.trim().slice(0, 50);
    const cleanUserId = (userId && typeof userId === 'string') 
      ? userId.trim() 
      : `usr_${Math.random().toString(36).substring(2, 10)}`;

    const isHost = cleanUserId === room.host_user_id;

    const member = await addRoomMember(room.id, {
      userId: cleanUserId,
      displayName: cleanName,
      role: isHost ? 'host' : 'guest',
    });

    return NextResponse.json({
      success: true,
      room,
      member,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to join room';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
