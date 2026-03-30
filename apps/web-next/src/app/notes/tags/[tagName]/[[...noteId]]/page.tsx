import { NotesContainer } from "@/features/notes";

interface TagNotesPageProps {
  params: Promise<{
    tagName: string;
    noteId?: string[];
  }>;
}

/**
 * タグ固有のノートページ (Server Component)
 * タグ名と、オプションのノートIDを処理します。
 */
export default async function TagNotesPage({ params }: TagNotesPageProps) {
  const { tagName, noteId } = await params;

  // noteId は配列（[[...noteId]]）なので、最初の要素を取得
  const currentNoteId = noteId?.[0];

  return (
    <div className="container mx-auto py-8">
      <NotesContainer
        context={{ type: "tag", value: tagName }}
        selectedNoteId={currentNoteId}
      />
    </div>
  );
}
