'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, Send, Megaphone, Users, GraduationCap, User } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';

const broadcastSchema = z.object({
  title: z.string().min(3).max(100),
  message: z.string().min(10).max(500),
  target: z.enum(['all', 'students', 'teachers', 'parents']),
});

type BroadcastForm = z.infer<typeof broadcastSchema>;

const TARGET_OPTIONS = [
  { value: 'all', label: 'All users', icon: <Users size={14} /> },
  { value: 'students', label: 'Students only', icon: <GraduationCap size={14} /> },
  { value: 'teachers', label: 'Teachers only', icon: <User size={14} /> },
  { value: 'parents', label: 'Parents only', icon: <User size={14} /> },
];

export default function AdminNotificationsPage() {
  const { t } = useString();
  const [sent, setSent] = useState<{ title: string; target: string; count?: number } | null>(null);

  const form = useForm<BroadcastForm>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { title: '', message: '', target: 'all' },
  });

  const broadcastMutation = useMutation({
    mutationFn: (data: BroadcastForm) =>
      apiClient.post('/notifications/broadcast', data),
    onSuccess: (res: any, vars) => {
      setSent({ title: vars.title, target: vars.target, count: res.data?.sent });
      form.reset();
      toast.success(t('notifications.broadcast_sent', {}, 'Broadcast notification sent'));
    },
    onError: () => toast.error(t('common.error', {}, 'Failed to send notification')),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone size={24} />
          {t('nav.notifications', {}, 'Notifications')}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {t('admin.notifications_desc', {}, 'Send broadcast notifications to users by role.')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Broadcast form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send size={16} />
              {t('notifications.new_broadcast', {}, 'Send Broadcast')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(d => broadcastMutation.mutate(d))}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>{t('common.title', {}, 'Title')}</Label>
                <Input
                  {...form.register('title')}
                  placeholder={t('notifications.broadcast_title_placeholder', {}, 'e.g. New word lists added!')}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{t('notifications.message', {}, 'Message')}</Label>
                <Textarea
                  {...form.register('message')}
                  rows={4}
                  placeholder={t('notifications.broadcast_message_placeholder', {}, 'Write your message here...')}
                  className="resize-none"
                />
                {form.formState.errors.message && (
                  <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{t('notifications.audience', {}, 'Audience')}</Label>
                <Select
                  defaultValue="all"
                  onValueChange={v => form.setValue('target', v as BroadcastForm['target'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          {opt.icon}
                          {t(`notifications.target_${opt.value}`, {}, opt.label)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={broadcastMutation.isPending}>
                <Send size={14} className="mr-2" />
                {broadcastMutation.isPending
                  ? t('common.sending', {}, 'Sending...')
                  : t('notifications.send_broadcast', {}, 'Send notification')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Confirmation / tips */}
        <div className="space-y-4">
          {sent && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <Bell size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-green-700 dark:text-green-400">
                        {t('notifications.broadcast_delivered', {}, 'Broadcast delivered!')}
                      </p>
                      {sent.count !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {sent.count} {t('notifications.recipients', {}, 'recipients')}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium">{sent.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    → {t(`notifications.target_${sent.target}`, {}, sent.target)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('notifications.broadcast_tips_title', {}, 'Tips')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2.5">
                <span className="text-primary mt-0.5">•</span>
                <p>{t('notifications.tip_1', {}, 'Broadcasts are sent as in-app database notifications and push notifications to subscribed devices.')}</p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-primary mt-0.5">•</span>
                <p>{t('notifications.tip_2', {}, 'Keep titles short — under 60 characters is ideal for push notification display.')}</p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-primary mt-0.5">•</span>
                <p>{t('notifications.tip_3', {}, 'Use audience targeting to avoid notification fatigue.')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
