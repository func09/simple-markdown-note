import { Notes } from "@/features/notes";

/**
 * ノート一覧ページ (Server Component)
 * クエリパラメータ (scope, tag) に基づいてノートを表示します。
 */
export default function NotesPage() {
  return (
    <div className="h-full w-full">
      <Notes />
    </div>
  );
}
