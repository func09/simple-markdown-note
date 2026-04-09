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
 * タグビルド時に注入されたアプリバージョンを取得します。
 * 未指定時は既存設定値を利用します。
 * @param {ExpoConfig} config Expoの既存設定
 * @returns {string} アプリの表示バージョン
 */
const getAppVersion = (config: Partial<ExpoConfig>): string => {
  return process.env.EXPO_APP_VERSION || config.version || "1.0.0";
};

/**
 * タグビルド時に注入されたiOSのビルド番号を取得します。
 * @param {ExpoConfig} config Expoの既存設定
 * @returns {string | undefined} iOSビルド番号
 */
const getIosBuildNumber = (config: Partial<ExpoConfig>): string | undefined => {
  return process.env.IOS_BUILD_NUMBER || config.ios?.buildNumber;
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
  version: getAppVersion(config),
  ios: {
    ...config.ios,
    buildNumber: getIosBuildNumber(config),
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
