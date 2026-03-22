// app/chapters/[id]/page.tsx

import StudyChapterPage from "@/components/study/study-chapter-page";

type PageProps = {
  params: {
    id: string;
  };
};

export default function Page({ params }: PageProps) {
  return <StudyChapterPage key={params.id} />;
}