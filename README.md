# simplenote-clone

## 開発環境の起動

本プロジェクトは pnpm ワークスペースを利用しており、ローカル環境で直接アプリを起動できます。

### 1. 依存関係のインストール

プロジェクトルートで以下のコマンドを実行します。

```bash
pnpm install
```

### 2. コンテナの起動（アプリの実行）

API と Web フロントエンドを一括で起動します。

```bash
pnpm dev
```

- **Web UI**: [http://localhost:5173](http://localhost:5173)
- **API**: [http://localhost:3000](http://localhost:3000)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555) (DB の中身をブラウザで見れます)

### 3. テストの実行

各パッケージのテストを実行できます。

**プロジェクト全体のテスト**

```bash
pnpm test
```

**特定のアプリのみテスト**

```bash
pnpm -F web test
# または
pnpm -F api test
```

### 4. データベースの初期化・同期

初回起動時やスキーマ変更時には、以下のコマンドでデータベースを同期してください。

```bash
pnpm -F database db:push
```

### 5. シードデータの投入

開発用の初期データ（テストユーザーやノート）を投入します。

```bash
# データベースのワークスペースに移動して実行
cd packages/database
pnpm generate
pnpm db:seed
```

### 6. コードフォーマット・チェック (Biome)

プロジェクト全体をチェックします。

```bash
pnpm lint
pnpm format
```

### 7. デスクトップアプリ (Electron) の起動

アプリ本体（`pnpm dev`）が起動している状態で、以下のコマンドを実行するとデスクトップ版が起動します。

```bash
pnpm -F desktop dev
```
