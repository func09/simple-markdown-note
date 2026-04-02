const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");

// モノレポのルートパスを取得
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. 全てのワークスペースファイルを監視対象に含める
config.watchFolders = [workspaceRoot];

// モバイル以外のアプリディレクトリの変更でリロードされないよう除外
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
config.resolver.blockList = [
  new RegExp(`^${escapeRegExp(path.resolve(workspaceRoot, "apps/web"))}/.*`),
  new RegExp(
    `^${escapeRegExp(path.resolve(workspaceRoot, "apps/desktop"))}/.*`
  ),
];

// 2. 依存関係の解決パスにモノレポルートの node_modules を追加
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./src/app/global.css" });
