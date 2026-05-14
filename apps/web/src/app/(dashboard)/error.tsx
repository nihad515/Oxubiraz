'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle size={28} className="text-destructive" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold">Xəta baş verdi</h2>
            <p className="text-sm text-muted-foreground">
              Bu səhifə yüklənərkən xəta baş verdi. Yenidən cəhd edin.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center pt-2">
            <Button size="sm" onClick={reset}>
              <RefreshCw size={14} className="mr-1.5" />
              Yenidən cəhd et
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard">
                <Home size={14} className="mr-1.5" />
                Ana səhifə
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
