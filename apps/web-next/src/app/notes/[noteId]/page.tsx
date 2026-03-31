import { Notes } from "@/features/notes";

interface NotePageProps {
  params: Promise<{
    noteId: string;
  }>;
  searchParams: Promise<{
    scope?: string;
    tag?: string;
  }>;
}

/**
 * 個別ノート選択ページ (Server Component)
 * パスパラメータ (noteId) と クエリパラメータ (scope, tag) に基づいてノートを表示します。
 */
export default async function NotePage({
  params,
  searchParams,
}: NotePageProps) {
  const { noteId } = await params;
  const { scope, tag } = await searchParams;

  // デフォルトスコープは "all"
  const currentScope = scope || "all";

  return (
    <div className="h-full w-full">
      <Notes
        context={
          tag
            ? { type: "tag", value: tag }
            : { type: "scope", value: currentScope }
        }
        selectedNoteId={noteId}
      />
    </div>
  );
}
