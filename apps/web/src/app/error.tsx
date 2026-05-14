'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error tracking service (e.g. Sentry) here
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle size={40} className="text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Xəta baş verdi</h1>
          <p className="text-muted-foreground">
            Gözlənilməz bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Xəta kodu: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw size={16} className="mr-2" />
            Yenidən cəhd et
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Ana səhifə
          </Button>
        </div>
      </div>
    </div>
  );
}
