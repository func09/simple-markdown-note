import { Notes } from "@/features/notes";

/**
 * 個別ノート選択ページ (Server Component)
 * パスパラメータ (noteId) に基づいてノートを表示します。
 */
export default async function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;

  return (
    <div className="h-full w-full">
      <Notes selectedNoteId={noteId} />
    </div>
  );
}
