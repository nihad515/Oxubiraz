import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen size={40} className="text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-black text-primary/20 leading-none">404</h1>
          <h2 className="text-2xl font-bold">Səhifə tapılmadı</h2>
          <p className="text-muted-foreground">
            Axtardığınız səhifə mövcud deyil və ya köçürülüb.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft size={16} className="mr-2" />
              Ana səhifəyə qayıt
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/student/game">Oyun oyna</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
