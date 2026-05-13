import type { Metadata } from 'next';

import { GameLauncher } from '@/components/game/game-launcher';

export const metadata: Metadata = {
  title: 'Play',
};

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <GameLauncher />
    </div>
  );
}
