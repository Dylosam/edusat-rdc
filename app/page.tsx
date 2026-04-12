import { getPublicPlatformSettings } from '@/lib/platform-settings';
import HomeSessionGate from '@/components/system/HomeSessionGate';
import LandingPageClient from '@/components/system/landing-page-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LandingPage() {
  const settings = await getPublicPlatformSettings();

  return (
    <>
      <HomeSessionGate />
      <LandingPageClient
        platformName={settings.platform_name}
        platformTagline={settings.platform_tagline}
        supportEmail={settings.support_email}
        canRegister={settings.allow_registrations}
      />
    </>
  );
}