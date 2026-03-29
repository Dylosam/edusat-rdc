import 'server-only';
import { createClient } from '@supabase/supabase-js';

export type PublicPlatformSettings = {
  id: string;
  platform_name: string;
  platform_tagline: string;
  support_email: string;
  default_language: 'fr' | 'en';
  timezone: string;
  allow_registrations: boolean;
  theme_mode: 'system' | 'light' | 'dark';
  accent_color: string;
  seo_title: string;
  seo_description: string;
  maintenance_mode: boolean;
};

const defaultPublicSettings: PublicPlatformSettings = {
  id: 'main',
  platform_name: 'EduStat RDC',
  platform_tagline: 'Apprendre intelligemment, réussir durablement',
  support_email: 'support@edustat.cd',
  default_language: 'fr',
  timezone: 'Africa/Kinshasa',
  allow_registrations: true,
  theme_mode: 'dark',
  accent_color: '#0f172a',
  seo_title: 'EduStat-RDC - Réussir l’école avec méthode et discipline',
  seo_description:
    'Plateforme éducative structurée pour les élèves congolais. Cours, exercices, quiz et suivi de progression.',
  maintenance_mode: false,
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL est manquant.');
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY est manquant.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getPublicPlatformSettings(): Promise<PublicPlatformSettings> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select(
      `
      id,
      platform_name,
      platform_tagline,
      support_email,
      default_language,
      timezone,
      allow_registrations,
      theme_mode,
      accent_color,
      seo_title,
      seo_description,
      maintenance_mode
    `
    )
    .eq('id', 'main')
    .maybeSingle();

  if (error) {
    console.error('Erreur chargement platform_settings:', error.message);
    return defaultPublicSettings;
  }

  if (!data) {
    return defaultPublicSettings;
  }

  return {
    ...defaultPublicSettings,
    ...data,
  } as PublicPlatformSettings;
}