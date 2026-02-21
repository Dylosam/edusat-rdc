// lib/mock-api/data.ts
import type { Subject } from "@/lib/types";

/**
 * Mock subjects pour le dashboard / subjects list.
 * Assure-toi que les champs matchent ton type Subject.
 */
const SUBJECTS: Subject[] = [
  {
    id: "sub-math",
    slug: "mathematiques",
    name: "Mathématiques",
    description: "Algèbre, fonctions, géométrie, trigonométrie…",
    icon: "Sigma", // doit exister dans lucide-react (sinon ça retombe sur BookOpen)
    color: "from-indigo-500 to-purple-500",
    chaptersCount: 12,
    progress: 18,
  },
  {
    id: "sub-phys",
    slug: "physique",
    name: "Physique",
    description: "Mécanique, électricité, optique, énergie…",
    icon: "Zap",
    color: "from-amber-500 to-orange-500",
    chaptersCount: 10,
    progress: 7,
  },
  {
    id: "sub-chim",
    slug: "chimie",
    name: "Chimie",
    description: "Réactions, atomes, solutions, stœchiométrie…",
    icon: "FlaskConical",
    color: "from-emerald-500 to-teal-500",
    chaptersCount: 9,
    progress: 0,
  },
  {
    id: "sub-bio",
    slug: "biologie",
    name: "Biologie",
    description: "Cellules, génétique, physiologie…",
    icon: "Dna",
    color: "from-sky-500 to-cyan-500",
    chaptersCount: 8,
    progress: 0,
  },
];

/**
 * API mock: retourne la liste des matières.
 * Le dashboard l'appelle via: const subjectsData = await getSubjects();
 */
export async function getSubjects(): Promise<Subject[]> {
  // Simule un petit délai réseau (facultatif)
  // await new Promise((r) => setTimeout(r, 150));
  return SUBJECTS;
}

/**
 * Optionnel : si tu as besoin d'une matière par slug.
 */
export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const found = SUBJECTS.find((s) => s.slug === slug);
  return found ?? null;
}