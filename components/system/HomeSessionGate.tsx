'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function HomeSessionGate() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseBrowser.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          router.replace('/dashboard');
          return;
        }
      } catch (error) {
        console.error('[home] session check error:', error);
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        router.replace('/dashboard');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!checking) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background" aria-hidden="true" />
  );
}