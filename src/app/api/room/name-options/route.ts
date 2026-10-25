import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode, getRoomMembers, generateNumericSuffixOptions } from '@/lib/roomStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get('roomCode');
    const name = searchParams.get('name');

    if (!roomCode || typeof roomCode !== 'string') {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const members = await getRoomMembers(room.id);
    const takenNames = new Set(members.map((m) => m.display_name.trim().toLowerCase()));

    const suggestions = generateNumericSuffixOptions(name.trim(), takenNames, 4);

    return NextResponse.json({
      success: true,
      baseName: name.trim().replace(/-\d{4,}$/, ''),
      suggestions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate name options';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
