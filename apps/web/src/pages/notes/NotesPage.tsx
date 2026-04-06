import { AuthGuard } from "@/features/auth/components";
import { NotesIndexScreen } from "@/features/notes";
/**
 * ノート一覧画面のルートページコンポーネント。
 * ログイン必須のガード枠として、NotesIndexScreenを子要素として描画します。
 */
export default function NotesPage() {
  return (
    <AuthGuard>
      <div className="h-full w-full">
        <NotesIndexScreen />
      </div>
    </AuthGuard>
  );
}
