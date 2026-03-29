type MaintenancePageProps = {
  platformName: string;
  supportEmail: string;
};

export default function MaintenancePage({
  platformName,
  supportEmail,
}: MaintenancePageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border text-xl font-bold">
          !
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          {platformName} est temporairement en maintenance
        </h1>

        <p className="mt-3 text-sm text-muted-foreground leading-6">
          Nous effectuons actuellement quelques améliorations pour rendre la
          plateforme encore meilleure. Merci de revenir un peu plus tard.
        </p>

        <div className="mt-6 rounded-xl border bg-muted/30 p-4 text-sm">
          Besoin d’aide ? Contacte-nous à{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="font-medium underline underline-offset-4"
          >
            {supportEmail}
          </a>
        </div>
      </div>
    </main>
  );
}