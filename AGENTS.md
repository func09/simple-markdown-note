# AGENTS.md

## 👤 AIエージェントの役割と責任

### 1. @architect (全体設計・DevOps・インフラ)
* **役割**: `docker-compose` による開発環境の定義、モノレポ構造の維持、Prisma スキーマおよび OpenAPI 定義の統括。
* **責任**: SQLite を「サーバー」ではなく「共有ボリューム上のファイル」として設計し、データの永続性を保証すること。全ての開発者が `docker-compose up` だけで同一環境を起動できる状態を維持する。

### 2. @backend (Hono API)
* **役割**: Hono による Node.js API の実装。JWT 認証、Prisma による SQLite 操作、S3互換ストレージ (MinIO/R2) 連携。
* **責任**: OpenAPI 定義を「唯一の真実」とし、フロントエンドと齟齬のない型安全なエンドポイントを構築すること。APIコンテナ内で SQLite ファイルを正しく管理する。

### 3. @web-frontend (React / UI)
* **役割**: React による Web UI の実装。OpenAPI から生成されたクライアントを用いた API 通信。
* **責任**: `DESIGN.md` に基づくレスポンシブな UI の構築と、オフラインキャッシュ (IndexedDB) の管理。

### 4. @desktop-ios (Electron / SwiftUI)
* **役割**: 後続フェーズにおける Electron (macOS) および SwiftUI (iOS) の実装。
* **責任**: Web 版で固まったロジックを各ネイティブ環境へ適応させ、OS 特有の UX を統合すること。

## 🤖 開発プラットフォームの運用ルール
* **Docker環境**: 開発は原則 Docker コンテナ内で行う。DB (SQLite) はホスト側の `storage/` ディレクトリに永続化する。
* **スキーマファースト**: DB 変更時は Prisma Schema、API 変更時は OpenAPI スキーマを先に更新し、各エージェント間で型を同期する。