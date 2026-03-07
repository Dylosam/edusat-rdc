// lib/mock-data/chapters.ts
// ✅ Mock chapters for subjects pages

export type Chapter = {
  id: string;
  subjectId?: string;     // optionnel (si tu utilises un id)
  subjectSlug?: string;   // recommandé (stable)
  title: string;
  description?: string;
  estimatedMinutes?: number;
  order?: number;
};

// ⚠️ Mets ici tes slugs EXACTS (ceux de subjects.ts)
// Exemple: "analyse" doit correspondre à subject.slug
export const chapters: Chapter[] = [
  // ---------- Analyse ----------
  {
    id: "analyse-01",
    subjectSlug: "analyse",
    title: "Introduction aux fonctions",
    description: "Définition, image, antécédent, lecture de graphe.",
    estimatedMinutes: 45,
    order: 1,
  },
  {
    id: "analyse-02",
    subjectSlug: "analyse",
    title: "Limites et continuité",
    description: "Comprendre la notion de limite et la continuité.",
    estimatedMinutes: 60,
    order: 2,
  },
  {
    id: "analyse-03",
    subjectSlug: "analyse",
    title: "Dérivées",
    description: "Taux de variation, dérivation, tangente, applications.",
    estimatedMinutes: 75,
    order: 3,
  },
  {
    id: "analyse-04",
    subjectSlug: "analyse",
    title: "Intégrales",
    description: "Primitive, intégrale, aire sous la courbe, méthodes.",
    estimatedMinutes: 80,
    order: 4,
  },

  // ---------- Trigonométrie ----------
  {
    id: "trigo-01",
    subjectSlug: "trigonometrie",
    title: "Angles, radian et cercle trigonométrique",
    description: "Mesure en radians, repérage sur le cercle.",
    estimatedMinutes: 55,
    order: 1,
  },
  {
    id: "trigo-02",
    subjectSlug: "trigonometrie",
    title: "Sinus, cosinus, tangente",
    description: "Définitions, valeurs remarquables, interprétation.",
    estimatedMinutes: 60,
    order: 2,
  },

  // ---------- Géométrie ----------
  {
    id: "geo-01",
    subjectSlug: "geometrie",
    title: "Vecteurs et repérage",
    description: "Coordonnées, opérations sur les vecteurs, colinéarité.",
    estimatedMinutes: 50,
    order: 1,
  },

  // ---------- Statistiques ----------
  {
    id: "stats-01",
    subjectSlug: "statistique",
    title: "Séries statistiques",
    description: "Effectifs, fréquences, moyenne, médiane, mode.",
    estimatedMinutes: 45,
    order: 1,
  },
];

// Optionnel: accès rapide par slug
export const chaptersBySubjectSlug: Record<string, Chapter[]> = chapters.reduce(
  (acc, ch) => {
    const key = ch.subjectSlug ?? "unknown";
    acc[key] = acc[key] || [];
    acc[key].push(ch);
    return acc;
  },
  {} as Record<string, Chapter[]>
);