import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode, isRoomMember } from '@/lib/roomStore';
import { createLiveKitToken } from '@/lib/livekit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, participantIdentity, participantName } = body;

    // 1. Validate room code
    if (!roomCode || typeof roomCode !== 'string') {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    // 2. Validate participant identity and name
    if (!participantIdentity || !participantName) {
      return NextResponse.json(
        { error: 'Participant identity and name required' },
        { status: 400 }
      );
    }

    const cleanIdentity = String(participantIdentity).trim().slice(0, 80);
    const cleanName = String(participantName).trim().slice(0, 50);

    // 3. Validate room exists and is active
    const room = await getRoomByCode(roomCode);
    if (!room) {
      return NextResponse.json(
        { error: 'Cannot issue token: Room does not exist or has expired' },
        { status: 404 }
      );
    }

    // 4. Validate participant is an authorized room member
    const authorized = await isRoomMember(room.id, cleanIdentity);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Participant must join the room before receiving a media token' },
        { status: 403 }
      );
    }

    // 5. Generate and return LiveKit token
    const tokenResponse = await createLiveKitToken({
      roomCode: room.room_code,
      participantIdentity: cleanIdentity,
      participantName: cleanName,
    });

    return NextResponse.json(tokenResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Token error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

