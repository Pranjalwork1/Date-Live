import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/roomStore';
import { ThemeType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hostName, title, theme, hostUserId } = body;

    if (!hostName || typeof hostName !== 'string' || !hostName.trim()) {
      return NextResponse.json(
        { error: 'Please enter your name' },
        { status: 400 }
      );
    }

    const cleanHostName = hostName.trim().slice(0, 50);
    const cleanTitle = (title && typeof title === 'string') ? title.trim().slice(0, 80) : 'Our Movie Night';
    const validThemes: ThemeType[] = ['midnight', 'candlelight', 'lavender', 'cinema'];
    const chosenTheme: ThemeType = validThemes.includes(theme) ? theme : 'midnight';
    const cleanHostUserId = (hostUserId && typeof hostUserId === 'string') ? hostUserId.trim() : undefined;

    const room = await createRoom({
      hostName: cleanHostName,
      title: cleanTitle,
      theme: chosenTheme,
      hostUserId: cleanHostUserId,
    });

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create room';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
