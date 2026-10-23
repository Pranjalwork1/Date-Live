import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode } from '@/lib/roomStore';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    const room = await getRoomByCode(code);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or has expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
