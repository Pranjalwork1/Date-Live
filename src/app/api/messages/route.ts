import { NextRequest, NextResponse } from 'next/server';
import { getRoomMessages, addRoomMessage, getRoomByCode } from '@/lib/roomStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const roomCode = searchParams.get('roomCode');

    let resolvedRoomId = roomId;

    if (!resolvedRoomId && roomCode) {
      const room = await getRoomByCode(roomCode);
      if (room) resolvedRoomId = room.id;
    }

    if (!resolvedRoomId) {
      return NextResponse.json({ error: 'Room ID or Code required' }, { status: 400 });
    }

    const messages = await getRoomMessages(resolvedRoomId);
    return NextResponse.json({ success: true, messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch messages';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, senderId, senderName, content } = body;

    if (!roomId || !senderId || !senderName || !content) {
      return NextResponse.json(
        { error: 'Missing required message fields' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum length of 2000 characters' },
        { status: 400 }
      );
    }

    const message = await addRoomMessage(roomId, {
      senderId,
      senderName,
      content,
    });

    return NextResponse.json({ success: true, message });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send message';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
