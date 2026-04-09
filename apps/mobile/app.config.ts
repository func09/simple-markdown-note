import path from "node:path";
import dotenv from "dotenv";
import type { ConfigContext, ExpoConfig } from "expo/config";

// 実行環境に応じて .env ファイルを切り替える（monorepo対策）
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: path.resolve(__dirname, envFile) });

/**
 * 必須環境変数を取得する
 * @param {string} key 環境変数キー
 * @returns {string} 環境変数値
 */
const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
};

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
    bundleIdentifier: getRequiredEnv("IOS_BUNDLE_IDENTIFIER"),
    appleTeamId: getRequiredEnv("APPLE_TEAM_ID"),
    infoPlist: {
      ...config.ios?.infoPlist,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  extra: {
    ...config.extra,
    eas: {
      ...config.extra?.eas,
      projectId: getRequiredEnv("EXPO_PUBLIC_EAS_PROJECT_ID"),
    },
  },
});
