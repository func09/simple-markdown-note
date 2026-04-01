import { AuthGuard, GuestGuard } from "@/features/auth/components";

/**
 * ルートパス (/) へのアクセスを適切にリダイレクトします (Server Component)。
 * 実際の判定は Client Component である Guard に任せることで、プラットフォームを選ばず動作させます。
 * - ログイン済みの場合: GuestGuard が検知して /notes へ
 * - 未ログインの場合: AuthGuard が検知して /login へ
 */
export default function IndexPage() {
  return (
    <GuestGuard>
      <AuthGuard>{null}</AuthGuard>
    </GuestGuard>
  );
}
