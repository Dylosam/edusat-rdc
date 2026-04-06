'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabaseBrowser } from '@/lib/supabase/client';

const PUBLIC_PATHS = new Set([
  '/',
  '/auth/login',
  '/auth/register',
]);

const HEARTBEAT_INTERVAL_MS = 60_000;

async function sendPresencePing() {
  const {
    data: { session },
  } = await supabaseBrowser.auth.getSession();

  const token = session?.access_token;

  if (!token) return;

  await fetch('/api/presence', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function AuthPresenceSync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.has(pathname);

    if (isPublicPath) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;
    let redirecting = false;

    const safeLogoutAndRedirect = async (message: string) => {
      if (redirecting || cancelled) return;
      redirecting = true;

      try {
        await supabaseBrowser.auth.signOut({ scope: 'local' });
      } catch (error) {
        console.error('[AuthPresenceSync] signOut error:', error);
      }

      if (!cancelled) {
        toast.error(message);
        router.replace('/auth/login');
      }
    };

    const run = async () => {
      try {
        const {
          data: { session },
        } = await supabaseBrowser.auth.getSession();

        if (!session?.user) {
          return;
        }

        const userId = session.user.id;

        const { data: profile, error } = await supabaseBrowser
          .from('profiles')
          .select('status, deleted_at')
          .eq('id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('[AuthPresenceSync] profile error:', error);
          return;
        }

        if (!profile || profile.deleted_at) {
          await safeLogoutAndRedirect('Votre compte a été supprimé.');
          return;
        }

        if (profile.status === 'banned') {
          await safeLogoutAndRedirect('Votre compte a été banni.');
          return;
        }

        if (profile.status === 'suspended') {
          await safeLogoutAndRedirect('Votre compte est suspendu.');
          return;
        }

        await sendPresencePing();
      } catch (error) {
        console.error('[AuthPresenceSync] unexpected error:', error);
      }
    };

    void run();

    intervalId = setInterval(() => {
      void run();
    }, HEARTBEAT_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void run();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;

      if (intervalId) {
        clearInterval(intervalId);
      }

      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [pathname, router]);

  return null;
}