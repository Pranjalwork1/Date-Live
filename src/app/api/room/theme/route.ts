import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode, updateRoomTheme } from '@/lib/roomStore';
import { normalizeTheme } from '@/lib/themes';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, theme } = body;

    if (!roomCode || !theme) {
      return NextResponse.json({ error: 'roomCode and theme are required' }, { status: 400 });
    }

    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const validTheme = normalizeTheme(theme);
    await updateRoomTheme(room.id, validTheme);

    return NextResponse.json({ success: true, theme: validTheme });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update theme';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
