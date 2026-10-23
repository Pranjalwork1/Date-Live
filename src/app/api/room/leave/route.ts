import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode, removeRoomMember } from '@/lib/roomStore';

export async function POST(req: NextRequest) {
  try {
    let body: { roomCode?: string; userId?: string } = {};
    const text = await req.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        // fallback
      }
    }

    const { roomCode, userId } = body;

    if (!roomCode || !userId) {
      return NextResponse.json({ error: 'roomCode and userId are required' }, { status: 400 });
    }

    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    await removeRoomMember(room.id, userId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to leave room';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
