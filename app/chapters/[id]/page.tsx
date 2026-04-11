import StudyChapterPage from "@/components/study/study-chapter-page";

export const dynamic = "force-dynamic";

type PageProps = {
  params: {
    id: string;
  };
};

export default function Page({ params }: PageProps) {
  return <StudyChapterPage chapterId={params.id} key={params.id} />;
}