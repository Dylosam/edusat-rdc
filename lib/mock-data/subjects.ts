export type Subject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
};

export const subjects: Subject[] = [
  {
    id: "subject-algebre",
    slug: "algebre",
    title: "Algèbre",
    description:
      "Maîtrisez les bases de l'algèbre : expressions, équations, polynômes et raisonnements mathématiques.",
    icon: "Sigma",
    color: "#2563eb",
  },
  {
    id: "subject-analyse",
    slug: "analyse",
    title: "Analyse",
    description:
      "Approfondissez les limites, dérivées, variations et outils fondamentaux de l’analyse mathématique.",
    icon: "TrendingUp",
    color: "#7c3aed",
  },
  {
    id: "subject-trigonometrie",
    slug: "trigonometrie",
    title: "Trigonométrie",
    description:
      "Étudiez les angles, identités trigonométriques et applications géométriques.",
    icon: "Compass",
    color: "#ea580c",
  },
  {
    id: "subject-geometrie",
    slug: "geometrie",
    title: "Géométrie",
    description:
      "Retrouvez les notions essentielles de figures, droites, plans et démonstrations géométriques.",
    icon: "Shapes",
    color: "#16a34a",
  },
  {
    id: "subject-statistique",
    slug: "statistique",
    title: "Statistique",
    description:
      "Analysez des données, calculez les indicateurs et interprétez les résultats.",
    icon: "BarChart3",
    color: "#0891b2",
  },
  {
    id: "subject-physique",
    slug: "physique",
    title: "Physique",
    description:
      "Comprenez les lois fondamentales de la matière, du mouvement, de l’énergie et des gaz.",
    icon: "Atom",
    color: "#dc2626",
  },
  {
    id: "subject-chimie",
    slug: "chimie",
    title: "Chimie",
    description:
      "Explorez les atomes, molécules, réactions chimiques et calculs de base.",
    icon: "FlaskConical",
    color: "#ca8a04",
  },
];

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getSubjectBySlug(slug: string) {
  const key = normalizeKey(slug);
  return subjects.find((subject) => normalizeKey(subject.slug) === key);
}

export function getSubjectById(id: string) {
  const key = normalizeKey(id);
  return subjects.find((subject) => normalizeKey(subject.id) === key);
}