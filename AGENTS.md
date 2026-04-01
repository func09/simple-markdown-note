# AGENTS.md

## 👤 AIエージェントの役割と責任

### 1. @architect (全体設計・DevOps・インフラ)

* **役割**: 開発環境の定義、モノレポ構造の維持、Drizzle スキーマおよび OpenAPI 定義の統括。
* **責任**: ローカルD1を含むインフラ環境を定義し、データを永続化しつつ、全ての開発者が `pnpm dev` だけで同一環境を起動できる状態を維持すること。

### 2. @backend (Hono API)

* **役割**: Hono による Node.js API の実装。JWT 認証、Drizzle による D1 操作、S3互換ストレージ (R2等) 連携。

### 3. @web-frontend (React / UI)

* **役割**: React による Web UI の実装。
* **責任**: `DESIGN.md` に基づくレスポンシブな UI の構築と、オフラインキャッシュ (IndexedDB) の管理。

### 4. @desktop-ios (Electron / Expo)

* **役割**: 後続フェーズにおける Electron (macOS) および Expo (iOS) の実装。
* **責任**: Web 版で固まったロジックを各ネイティブ環境へ適応させ、OS 特有の UX を統合すること。

## 🤖 開発プラットフォームの運用ルール

* **開発環境**: 開発は原則ローカル環境（pnpm）で行う。DB は Wrangler 等のローカル D1 エミュレータを使用して永続化する。
* **スキーマファースト**: DB 変更時は Drizzle Schema、API 変更時は OpenAPI スキーマを先に更新し、各エージェント間で型を同期する。