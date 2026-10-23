'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveReaction } from '@/lib/types';

interface FloatingReactionsOverlayProps {
  reactions: ActiveReaction[];
  onCompleteReaction: (id: string) => void;
}

export default function FloatingReactionsOverlay({
  reactions,
  onCompleteReaction,
}: FloatingReactionsOverlayProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-40"
      aria-hidden="true"
    >
      <AnimatePresence>
        {reactions.map((r) => {
          const driftX = r.driftDirection * 70; // gentle horizontal swaying
          return (
            <motion.div
              key={r.id}
              initial={{
                opacity: 0,
                scale: 0.4,
                y: 50,
                x: 0,
              }}
              animate={{
                opacity: [0, 1, 1, 0.9, 0],
                scale: [0.5, 1.35, 1.2, 1.1, 0.8],
                y: -380,
                x: [0, driftX * 0.4, driftX * 0.8, driftX],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onAnimationComplete={() => onCompleteReaction(r.id)}
              className="absolute bottom-12 flex flex-col items-center select-none"
              style={{
                left: `${r.leftPercent}%`,
                filter: 'drop-shadow(0 0 12px rgba(244, 63, 94, 0.6))',
              }}
            >
              <span className="text-3xl sm:text-4xl">{r.emoji}</span>
              {r.senderName && (
                <span className="mt-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-medium text-rose-200 backdrop-blur-md border border-rose-500/30 whitespace-nowrap">
                  {r.senderName}
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
