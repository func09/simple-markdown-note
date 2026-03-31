"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated } from "@/features/auth/utils";

/**
 * ルートパス (/) へのアクセスを適切にリダイレクトします (Client Component)。
 * Electron や静的エクスポート環境でも動作するように、クライアントサイドで判定を行います。
 */
export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      // ログイン済みならノート一覧へ
      router.replace("/notes?scope=all");
    } else {
      // 未ログインならログイン画面へ
      router.replace("/login");
    }
  }, [router]);

  // リダイレクト中は何表示もしない
  return null;
}
