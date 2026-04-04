import type { ConfigContext, ExpoConfig } from "expo/config";

// .env を明示的に読み込む（monorepo対策）
import "dotenv/config";

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
