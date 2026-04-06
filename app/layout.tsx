import './globals.css';
import 'katex/dist/katex.min.css';

import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { getPublicPlatformSettings } from '@/lib/platform-settings';
import MaintenancePage from '@/components/system/MaintenancePage';
import AuthPresenceSync from '@/components/system/AuthPresenceSync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'Times', 'serif'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicPlatformSettings();

  const title =
    settings.seo_title ||
    `${settings.platform_name} - Réussir l'école avec méthode et discipline`;

  const description =
    settings.seo_description ||
    'Plateforme éducative structurée pour les élèves congolais. Cours, exercices, quiz et suivi de progression.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: 'https://bolt.new/static/og_default.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: 'https://bolt.new/static/og_default.png' }],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getPublicPlatformSettings();

  const isMaintenanceEnabled = settings.maintenance_mode === true;

  const bodyStyle = {
    '--accent-color': settings.accent_color || '#0f172a',
  } as CSSProperties;

  const resolvedTheme =
    settings.theme_mode === 'light' || settings.theme_mode === 'dark'
      ? settings.theme_mode
      : 'dark';

  return (
    <html lang="fr" translate="no">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
        style={bodyStyle}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={resolvedTheme}
          enableSystem={settings.theme_mode === 'system'}
          disableTransitionOnChange
        >
          <AuthPresenceSync />

          <div id="app-root" className="min-h-screen">
            {isMaintenanceEnabled ? (
              <MaintenancePage
                platformName={settings.platform_name}
                supportEmail={settings.support_email}
              />
            ) : (
              <main className="min-h-screen">{children}</main>
            )}
          </div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}