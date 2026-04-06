'use client';

import { useEffect, useRef } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function AuthSessionReset() {
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const resetSession = async () => {
      try {
        await supabaseBrowser.auth.signOut({ scope: 'local' });
      } catch (error) {
        console.error('[AuthSessionReset] signOut local error:', error);
      }

      try {
        const projectRef = new URL(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string
        ).host.split('.')[0];

        const storageKey = `sb-${projectRef}-auth-token`;
        window.localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('[AuthSessionReset] localStorage cleanup error:', error);
      }
    };

    void resetSession();
  }, []);

  return null;
}