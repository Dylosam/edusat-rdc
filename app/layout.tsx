import './globals.css';
import 'katex/dist/katex.min.css';

import type { Metadata } from 'next';
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

  return {
    title:
      settings.seo_title ||
      `${settings.platform_name} - Réussir l'école avec méthode et discipline`,
    description:
      settings.seo_description ||
      'Plateforme éducative structurée pour les élèves congolais. Cours, exercices, quiz et suivi de progression.',
    openGraph: {
      title: settings.seo_title || settings.platform_name,
      description:
        settings.seo_description ||
        'Plateforme éducative structurée pour les élèves congolais. Cours, exercices, quiz et suivi de progression.',
      images: [{ url: 'https://bolt.new/static/og_default.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seo_title || settings.platform_name,
      description:
        settings.seo_description ||
        'Plateforme éducative structurée pour les élèves congolais. Cours, exercices, quiz et suivi de progression.',
      images: [{ url: 'https://bolt.new/static/og_default.png' }],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicPlatformSettings();

  console.log('[RootLayout] maintenance_mode =', settings.maintenance_mode);

  const isMaintenanceEnabled = settings.maintenance_mode === true;

  if (isMaintenanceEnabled) {
    return (
      <html lang={settings.default_language} suppressHydrationWarning>
        <body
          className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
          style={
            {
              ['--accent-color' as string]: settings.accent_color || '#0f172a',
            } as React.CSSProperties
          }
        >
          <ThemeProvider
            attribute="class"
            defaultTheme={settings.theme_mode === 'system' ? 'dark' : settings.theme_mode}
            enableSystem={settings.theme_mode === 'system'}
            disableTransitionOnChange
          >
            <MaintenancePage
              platformName={settings.platform_name}
              supportEmail={settings.support_email}
            />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang={settings.default_language} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
        style={
          {
            ['--accent-color' as string]: settings.accent_color || '#0f172a',
          } as React.CSSProperties
        }
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={settings.theme_mode === 'system' ? 'dark' : settings.theme_mode}
          enableSystem={settings.theme_mode === 'system'}
          disableTransitionOnChange
        >
          <AuthPresenceSync />
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}