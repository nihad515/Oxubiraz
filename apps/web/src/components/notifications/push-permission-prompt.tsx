'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useString } from '@/hooks/use-string';
import { toast } from 'sonner';

const DISMISSED_KEY = 'push_prompt_dismissed';

export function PushPermissionPrompt() {
  const { t } = useString();
  const { permission, isSubscribed, isSupported, isLoading, subscribe } = usePushNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    if (permission !== 'default') return;
    if (isSubscribed) return;

    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    // Delay to avoid showing on page load before content renders
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [permission, isSubscribed, isSupported]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  const handleSubscribe = async () => {
    const ok = await subscribe();
    if (ok) {
      toast.success(t('notifications.push_enabled', {}, 'Push notifications enabled!'));
      setVisible(false);
    } else if (Notification.permission === 'denied') {
      toast.error(t('notifications.push_denied', {}, 'Notifications blocked. Enable them in browser settings.'));
      setVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm lg:bottom-6"
        >
          <div className="rounded-xl border bg-card p-4 shadow-lg">
            <button
              onClick={dismiss}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              aria-label={t('common.close', {}, 'Close')}
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bell size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {t('notifications.push_prompt_title', {}, 'Stay on top of your progress!')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('notifications.push_prompt_body', {}, 'Get notified about achievements, level-ups, and streaks.')}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                <Bell size={14} className="mr-1.5" />
                {t('notifications.push_enable', {}, 'Enable notifications')}
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                {t('common.not_now', {}, 'Not now')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PushToggle() {
  const { t } = useString();
  const { permission, isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported || permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff size={16} />
        {permission === 'denied'
          ? t('notifications.push_blocked', {}, 'Notifications blocked in browser settings')
          : t('notifications.push_unsupported', {}, 'Push notifications not supported in this browser')}
      </div>
    );
  }

  return (
    <Button
      variant={isSubscribed ? 'outline' : 'default'}
      size="sm"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
    >
      {isSubscribed ? (
        <>
          <BellOff size={14} className="mr-1.5" />
          {t('notifications.push_disable', {}, 'Disable notifications')}
        </>
      ) : (
        <>
          <Bell size={14} className="mr-1.5" />
          {t('notifications.push_enable', {}, 'Enable notifications')}
        </>
      )}
    </Button>
  );
}
