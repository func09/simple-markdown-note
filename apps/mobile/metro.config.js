const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// モノレポのルートパスを取得
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. 全てのワークスペースファイルを監視対象に含める
config.watchFolders = [workspaceRoot];

// 2. 依存関係の解決パスにモノレポルートの node_modules を追加
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./src/app/global.css" });
