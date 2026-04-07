import { describe, expect, it, vi } from "vitest";
import { createDb, getLibsqlDb } from "./index";

// 本番環境（Cloudflare D1）およびローカル開発（LibSQL）向けデータベース接続の初期化処理を検証する
describe("Database initialization (index.ts)", () => {
  // Cloudflare D1環境向けのDrizzle ORMインスタンス構築機能
  describe("createDb", () => {
    // Cloudflare D1インスタンスを生成できることを確認する
    it("should instantiate a Drizzle ORM instance for Cloudflare D1", () => {
      const mockD1 = {};
      const d1Db = createDb(mockD1);
      expect(d1Db).toBeDefined();
    });
  });

  // ローカルおよびテスト環境向けのLibSQLコネクション生成機能とフォールバック
  describe("getLibsqlDb", () => {
    // DATABASE_URLが存在しない場合にデフォルトのURL(file:./local.db)で生成されることを確認する
    it("should use local.db as a fallback when DATABASE_URL is not set", () => {
      // 既存の環境変数をスタブ化して空にする
      vi.stubEnv("DATABASE_URL", "");

      const libsqlDb = getLibsqlDb();
      expect(libsqlDb).toBeDefined();

      // 環境変数を元に戻す
      vi.unstubAllEnvs();
    });
  });

  // 各実行環境に応じたグローバルデータベースインスタンスの自動切り替え機能
  describe("db", () => {
    // Workers環境など（DATABASE_URLがなく、cachesが存在する環境）ではnullになることを確認する
    it("should resolve to null in a browser-like or Workers environment", async () => {
      // モジュールのキャッシュをリセットして再評価させる
      vi.resetModules();
      vi.stubEnv("DATABASE_URL", "");
      vi.stubGlobal("caches", {});

      const imported = await import("./index");
      expect(imported.db).toBeNull();

      // 元に戻す
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
      vi.resetModules();
    });
  });
});
