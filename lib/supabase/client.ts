import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🔒 Vérifications strictes
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL est manquant');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY est manquant');
}

// 🔑 Custom storage (plus stable sur certains environnements Next)
const customStorage: Storage | undefined =
  typeof window !== 'undefined' ? window.localStorage : undefined;

// 🚀 Client principal navigateur
export const supabaseBrowser: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,          // 🔥 garde la session après refresh
      autoRefreshToken: true,        // 🔄 refresh automatique du token
      detectSessionInUrl: true,      // 🔗 utile pour magic link / OAuth
      storageKey: 'edustat-main-auth', // 🧠 clé unique (important si multi-app)
      storage: customStorage,        // 💾 stockage explicite
    },
    global: {
      headers: {
        'X-Client-Info': 'edustat-rdc-web',
      },
    },
  }
);

// Alias simple
export const supabase = supabaseBrowser;