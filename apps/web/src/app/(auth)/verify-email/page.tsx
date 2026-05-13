'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';

export default function VerifyEmailPage() {
  const { t } = useString();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resent'>('verifying');

  const id = searchParams.get('id');
  const hash = searchParams.get('hash');
  const expires = searchParams.get('expires');
  const signature = searchParams.get('signature');

  const resendMutation = useMutation({
    mutationFn: () => apiClient.post(API.auth.verifyEmail + '/send'),
    onSuccess: () => setStatus('resent'),
  });

  useEffect(() => {
    if (!id || !hash) {
      setStatus('error');
      return;
    }

    apiClient
      .get(`${API.auth.verifyEmail}/${id}/${hash}?expires=${expires}&signature=${signature}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [id, hash, expires, signature]);

  if (status === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <Loader2 size={48} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('auth.verifying_email', {}, 'Verifying your email address...')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12 space-y-4">
            <CheckCircle size={48} className="mx-auto text-green-500" />
            <div>
              <h2 className="text-xl font-bold">{t('auth.email_verified', {}, 'Email Verified!')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('auth.email_verified_desc', {}, 'Your account has been successfully verified.')}
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push('/dashboard')}>
              {t('auth.go_to_dashboard', {}, 'Go to Dashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'resent') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12 space-y-4">
            <Mail size={48} className="mx-auto text-blue-500" />
            <div>
              <h2 className="text-xl font-bold">{t('auth.verification_sent', {}, 'Verification Email Sent')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('auth.check_inbox', {}, 'Check your inbox and click the link to verify your account.')}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
              {t('auth.back_to_login', {}, 'Back to Login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <XCircle size={48} className="mx-auto text-destructive" />
          <CardTitle>{t('auth.verification_failed', {}, 'Verification Failed')}</CardTitle>
          <CardDescription>
            {t('auth.verification_failed_desc', {}, 'The verification link is invalid or has expired.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
            {t('auth.resend_verification', {}, 'Resend Verification Email')}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => router.push('/login')}>
            {t('auth.back_to_login', {}, 'Back to Login')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
