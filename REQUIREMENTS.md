# REQUIREMENTS.md

## 🎯 プロジェクト目標
特定のクラウドベンダーに依存しない（脱ロックイン）、SQLite ファイルベースの堅牢な個人用ノートアプリ。
Docker Compose による再現性の高い環境と、OpenAPI によるスキーマ駆動開発を徹底する。

## 📅 開発ロードマップ（細分化フェーズ）

### フェーズ 1: 開発環境構築 & スキーマ設計 (Docker / Drizzle / OpenAPI)
* **Docker Setup**: `docker-compose.yml` の作成。Node.js (API/Web), MinIO (S3互換ストレージ), Drizzle Studio のコンテナ化。
* **DB/API Schema**: 
    - `packages/database` で Drizzle による SQLite テーブル定義。
    - `packages/openapi` で Zod による API 仕様定義。
* **Persistence**: ホストマシンの `storage/` ディレクトリと SQLite ファイル (`.db`) の同期設定。

### フェーズ 2: API 実装 & 認証 (Hono / JWT)
* **Auth**: JWT を用いたサインイン・認証ミドルウェアの実装。
* **CRUD**: ノートの作成・取得・更新・削除エンドポイントの実装。
* **Client Generation**: OpenAPI 定義からフロントエンド用 TypeScript クライアントの自動生成。

### フェーズ 3: Web フロントエンド MVP (React)
* **UI**: 3カラム・レスポンシブレイアウトの実装。
* **Sync**: 自動生成クライアントを用いた API 連携とオートセーブ。
* **Offline**: `IndexedDB` を用いた一時保存機能。

### フェーズ 4: 資産管理 & 検索 (Tags / Storage / FTS)
* **Tags**: Drizzle による多対多のタグ管理。
* **Storage**: S3 互換 API (MinIO) への画像アップロード。
* **Search**: SQLite FTS5 を用いた全文検索。

### フェーズ 5: デスクトップ展開 (macOS / Electron)
* **Desktop**: Electron によるパッケージ化。メニューバーやショートカットの統合。

### フェーズ 6: モバイル展開 (iOS / SwiftUI)
* **Mobile**: SwiftUI によるネイティブアプリの実装。

---

## 📂 ディレクトリ構成図 (モノレポ)

```text
.
├── apps/
│   ├── api/                # Hono API (Node.js / Standard Server)
│   ├── web/                # React (Web/Electron共有)
│   ├── desktop/            # Electron (Native shell)
│   └── ios/                # Swift / Xcode Project
├── packages/
│   ├── database/           # Drizzle Schema & Migrations
│   ├── openapi/            # OpenAPI (Zod) Definitions
│   └── common/             # Shared Types & Logic
├── docker/                 # 各アプリの Dockerfile
├── storage/                # SQLite (.db) & MinIO データの永続化領域
├── docker-compose.yml      # 全体環境定義
└── package.json