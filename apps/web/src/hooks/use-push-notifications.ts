'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function getVapidPublicKey(): Promise<string | null> {
  try {
    const res = await apiClient.get(API.push.vapidKey);
    return (res as any).data?.public_key ?? null;
  } catch {
    return null;
  }
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  useEffect(() => {
    if (!isSupported) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission as PermissionState);

    // Check existing subscription
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setIsSubscribed(!!sub);
      });
    });
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;

    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PermissionState);

      if (perm !== 'granted') return false;

      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) return false;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = sub.toJSON();
      await apiClient.post(API.push.subscribe, {
        endpoint: sub.endpoint,
        public_key: json.keys?.p256dh ?? '',
        auth_token: json.keys?.auth ?? '',
        content_encoding: (sub as any).options?.applicationServerKey ? 'aes128gcm' : 'aesgcm',
      });

      setIsSubscribed(true);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await apiClient.delete(API.push.unsubscribe, { data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }

      setIsSubscribed(false);
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return { permission, isSubscribed, isSupported, isLoading, subscribe, unsubscribe };
}
