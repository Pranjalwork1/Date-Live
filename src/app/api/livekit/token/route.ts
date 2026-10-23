import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode } from '@/lib/roomStore';
import { createLiveKitToken } from '@/lib/livekit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, participantIdentity, participantName } = body;

    if (!roomCode || typeof roomCode !== 'string') {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    if (!participantIdentity || !participantName) {
      return NextResponse.json(
        { error: 'Participant identity and name required' },
        { status: 400 }
      );
    }

    // Verify room actually exists and is active before granting access
    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json(
        { error: 'Cannot issue token: Room does not exist or has expired' },
        { status: 403 }
      );
    }

    const tokenResponse = await createLiveKitToken({
      roomCode: room.room_code,
      participantIdentity: String(participantIdentity).trim().slice(0, 80),
      participantName: String(participantName).trim().slice(0, 50),
    });

    return NextResponse.json(tokenResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
