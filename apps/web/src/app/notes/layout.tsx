import type { ReactNode } from "react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

/**
 * ノート機能全体の共通レイアウト (Protected)
 */
export default function NotesLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col overflow-hidden bg-white">
        {children}
      </div>
    </AuthGuard>
  );
}
