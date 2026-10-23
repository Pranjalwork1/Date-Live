import { NextRequest, NextResponse } from 'next/server';
import { deleteRoom } from '@/lib/roomStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, userId } = body;

    if (!roomCode || typeof roomCode !== 'string' || !userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'roomCode and userId are required' },
        { status: 400 }
      );
    }

    const result = await deleteRoom(roomCode, userId);
    if (!result.success) {
      const isAuthError = result.error?.startsWith('Unauthorized');
      return NextResponse.json(
        { error: result.error || 'Failed to delete room' },
        { status: isAuthError ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Room deleted permanently',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error deleting room';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
