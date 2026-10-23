import React, { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getRoomByCode } from '@/lib/roomStore';
import RoomClient from './RoomClient';
import Starfield from '@/components/Starfield';
import { HeartCrack, Home } from 'lucide-react';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}): Promise<Metadata> {
  const { roomCode } = await params;
  return {
    title: `${roomCode} — Moonlit Watch Together`,
    description: 'A cozy, romantic watch-together room for two.',
  };
}

async function RoomContent({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  const room = await getRoomByCode(roomCode);

  if (!room) {
    return (
      <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#070913] text-white">
        <Starfield density={50} />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-rose-500/20 bg-[#0d0f1f]/95 p-8 text-center shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4">
            <HeartCrack className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Room Unavailable</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            This movie date room code (<code className="font-mono text-rose-300">{roomCode}</code>) is either invalid, expired, or has ended.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-xs font-semibold text-white shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Create a New Date Room</span>
          </Link>
        </div>
      </div>
    );
  }

  return <RoomClient initialRoom={room} />;
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#070913] text-rose-300 text-xs">
          Loading your date room...
        </div>
      }
    >
      <RoomContent params={params} />
    </Suspense>
  );
}
