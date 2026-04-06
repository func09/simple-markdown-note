import path from "node:path";
import dotenv from "dotenv";
import type { ConfigContext, ExpoConfig } from "expo/config";

// 実行環境に応じて .env ファイルを切り替える（monorepo対策）
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: path.resolve(__dirname, envFile) });

/**
 * Expoのアプリケーション設定を定義するファクトリ関数
 * @param {ConfigContext} context Expoの設定コンテキスト
 * @returns {ExpoConfig} Expoのアプリケーション設定
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name || "Simple Markdown Note",
  slug: config.slug || "simple-markdown-note",
  ios: {
    ...config.ios,
    bundleIdentifier:
      process.env.IOS_BUNDLE_IDENTIFIER || "com.example.simplemarkdownnote",
    appleTeamId: process.env.APPLE_TEAM_ID || "XXXXXXXXXX", // ダミー値に修正
  },
});
