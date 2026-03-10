import { DashboardNav } from '@/components/dashboard-nav';
import { SchoolDocumentTool } from '@/components/tools/documents/school-document-tool';

export default function SchoolDocumentPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Document scolaire
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Rédigez, mettez en forme, sauvegardez et imprimez facilement vos devoirs
            dans une feuille propre, prête à être remise.
          </p>
        </div>

        <SchoolDocumentTool />
      </main>
    </div>
  );
}