'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Starfield from '@/components/Starfield';
import DynamicIsland from '@/components/island/DynamicIsland';
import JoinRoomModal from '@/components/modals/JoinRoomModal';
import CreateRoomModal from '@/components/modals/CreateRoomModal';

function JoinContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || '';
  const [isJoinOpen, setIsJoinOpen] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between bg-gradient-to-b from-[#070913] via-[#0d122b] to-[#120a1f] text-white overflow-hidden">
      <Starfield density={60} />

      <DynamicIsland
        mode="landing"
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenJoin={() => setIsJoinOpen(true)}
      />

      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <JoinRoomModal
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          initialCode={codeParam}
        />
        <CreateRoomModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#070913] text-rose-300 text-xs">
          Loading Moonlit...
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
