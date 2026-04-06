import { useParams } from "react-router-dom";
import { AuthGuard } from "@/features/auth/components";
import { NotesIndexScreen } from "@/features/notes";
/**
 * 個別のノート詳細画面（編集・プレビュー）のルートページコンポーネント。
 * ノートIDをURLパラメーターから取得し、ログイン必須のガード内で描画します。
 */
export default function NoteDetailPage() {
  const { noteId } = useParams();

  return (
    <AuthGuard>
      <div className="h-full w-full">
        <NotesIndexScreen selectedNoteId={noteId} />
      </div>
    </AuthGuard>
  );
}
