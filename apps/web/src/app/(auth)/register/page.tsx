'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useString } from '@/hooks/use-string';
import { cn } from '@/lib/utils/cn';
import { StudentRegisterForm } from '@/components/auth/student-register-form';
import { TeacherRegisterForm } from '@/components/auth/teacher-register-form';
import { ParentRegisterForm } from '@/components/auth/parent-register-form';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

type RoleTab = 'student' | 'teacher' | 'parent';

const ROLE_TABS: Array<{ role: RoleTab; icon: React.ReactNode; labelKey: string }> = [
  { role: 'student', icon: <GraduationCap size={18} />, labelKey: 'roles.student' },
  { role: 'teacher', icon: <Users size={18} />, labelKey: 'roles.teacher' },
  { role: 'parent', icon: <Heart size={18} />, labelKey: 'roles.parent' },
];

export default function RegisterPage() {
  const { t } = useString();
  const [activeRole, setActiveRole] = useState<RoleTab>('student');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('auth.register')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('auth.register_subtitle', {}, 'Create your account')}
          </p>
        </div>
        <LocaleSwitcher />
      </div>

      {/* Role selector tabs */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {ROLE_TABS.map(({ role, icon, labelKey }) => (
          <button
            key={role}
            type="button"
            onClick={() => setActiveRole(role)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition-all duration-200',
              'touch-manipulation min-h-[60px]',
              activeRole === role
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {icon}
            <span className="text-xs">{t(labelKey, {}, role)}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeRole === 'student' && <StudentRegisterForm />}
              {activeRole === 'teacher' && <TeacherRegisterForm />}
              {activeRole === 'parent' && <ParentRegisterForm />}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('auth.have_account', {}, 'Already have an account?')}{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </motion.div>
  );
}
