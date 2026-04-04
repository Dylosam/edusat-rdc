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

export default function AuthPresenceSync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const run = async () => {
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
        return;
      }

      if (!profile || profile.deleted_at) {
        await supabaseBrowser.auth.signOut();
        if (!PUBLIC_PATHS.has(pathname)) {
          toast.error('Votre compte a été supprimé.');
          router.push('/auth/login');
        }
        return;
      }

      if (profile.status === 'banned') {
        await supabaseBrowser.auth.signOut();
        if (!PUBLIC_PATHS.has(pathname)) {
          toast.error('Votre compte a été banni.');
          router.push('/auth/login');
        }
        return;
      }

      if (profile.status === 'suspended') {
        await supabaseBrowser.auth.signOut();
        if (!PUBLIC_PATHS.has(pathname)) {
          toast.error('Votre compte est suspendu.');
          router.push('/auth/login');
        }
        return;
      }

      await supabaseBrowser
        .from('profiles')
        .update({
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', userId);
    };

    void run();

    intervalId = setInterval(() => {
      void run();
    }, 60000);

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