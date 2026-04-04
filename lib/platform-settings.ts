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

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'oui', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'non', 'off', ''].includes(normalized)) return false;
  }
  return fallback;
}

function toLanguage(value: unknown): 'fr' | 'en' {
  return value === 'en' ? 'en' : 'fr';
}

function toThemeMode(value: unknown): 'system' | 'light' | 'dark' {
  if (value === 'system' || value === 'light' || value === 'dark') {
    return value;
  }
  return defaultPublicSettings.theme_mode;
}

function toStringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeSettings(data: Record<string, unknown>): PublicPlatformSettings {
  return {
    id: toStringValue(data.id, defaultPublicSettings.id),
    platform_name: toStringValue(data.platform_name, defaultPublicSettings.platform_name),
    platform_tagline: toStringValue(
      data.platform_tagline,
      defaultPublicSettings.platform_tagline
    ),
    support_email: toStringValue(data.support_email, defaultPublicSettings.support_email),
    default_language: toLanguage(data.default_language),
    timezone: toStringValue(data.timezone, defaultPublicSettings.timezone),
    allow_registrations: toBoolean(
      data.allow_registrations,
      defaultPublicSettings.allow_registrations
    ),
    theme_mode: toThemeMode(data.theme_mode),
    accent_color: toStringValue(data.accent_color, defaultPublicSettings.accent_color),
    seo_title: toStringValue(data.seo_title, defaultPublicSettings.seo_title),
    seo_description: toStringValue(
      data.seo_description,
      defaultPublicSettings.seo_description
    ),
    maintenance_mode: toBoolean(
      data.maintenance_mode,
      defaultPublicSettings.maintenance_mode
    ),
  };
}

export async function getPublicPlatformSettings(): Promise<PublicPlatformSettings> {
  if (!supabase) {
    console.error(
      'Variables Supabase publiques manquantes : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
    return defaultPublicSettings;
  }

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

  const normalized = normalizeSettings(data as Record<string, unknown>);

  console.log('[platform_settings]', {
    raw_maintenance_mode: (data as Record<string, unknown>).maintenance_mode,
    normalized_maintenance_mode: normalized.maintenance_mode,
    raw_allow_registrations: (data as Record<string, unknown>).allow_registrations,
    normalized_allow_registrations: normalized.allow_registrations,
  });

  return normalized;
}