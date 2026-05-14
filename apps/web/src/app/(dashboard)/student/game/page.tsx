import type { Metadata } from 'next';
import { GameLauncher } from '@/components/game/game-launcher';

export const metadata: Metadata = {
  title: 'Game',
};

export default function GamePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <GameLauncher />
    </div>
  );
}
