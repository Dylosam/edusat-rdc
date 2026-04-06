import {
  BookOpen,
  Calculator,
  Sigma,
  Atom,
  FlaskConical,
  BarChart3,
  Triangle,
  Globe,
  Leaf,
  type LucideIcon,
} from "lucide-react";

export type NormalizedSubject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  chaptersCount: number;
  progress: number;
};

export const subjectIconMap: Record<string, LucideIcon> = {
  BookOpen,
  Calculator,
  Sigma,
  Atom,
  FlaskConical,
  BarChart3,
  Triangle,
  Globe,
  Leaf,
};

export function normalizeSubject(subject: any, index = 0): NormalizedSubject {
  const id = String(subject?.id ?? index);
  const slug = String(subject?.slug ?? subject?.code ?? subject?.id ?? id);
  const name = String(
    subject?.name ?? subject?.title ?? subject?.label ?? "Matière"
  );
  const description = String(subject?.description ?? subject?.desc ?? subject?.summary ?? "");
  const icon =
    typeof subject?.icon === "string" && subject.icon.trim().length
      ? subject.icon
      : "BookOpen";

  const color =
    typeof subject?.color === "string" && subject.color.trim().length
      ? subject.color
      : "from-primary/30 to-primary/5";

  const chaptersCount = Number(
    subject?.chaptersCount ??
      subject?.chapters_count ??
      (Array.isArray(subject?.chapters) ? subject.chapters.length : 0) ??
      0
  );

  const progress = Number(subject?.progress ?? 0);

  return {
    id,
    slug,
    name,
    description,
    icon,
    color,
    chaptersCount,
    progress: Number.isNaN(progress) ? 0 : progress,
  };
}

export function getSubjectIcon(iconName?: string) {
  return subjectIconMap[iconName ?? "BookOpen"] ?? BookOpen;
}