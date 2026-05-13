import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left panel — brand/illustration (hidden on mobile) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center">
        {/* Decorative circles */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center gap-8 p-12 text-center text-white">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <span className="text-4xl font-black text-white">O</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight">Oxubiraz</h1>
            <p className="max-w-sm text-lg text-white/80">
              Uşaqlar üçün çoxdilli oxu sürəti platforması
            </p>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-6 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            {[
              { label: 'Şagird', value: '10K+' },
              { label: 'Məktəb', value: '500+' },
              { label: 'Dil', value: '3' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black">{value}</div>
                <div className="text-sm text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth forms */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2 font-black text-brand-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              O
            </div>
            Oxubiraz
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
