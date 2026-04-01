# simplenote-clone

## 開発環境の起動

本プロジェクトは pnpm ワークスペースを利用しており、ローカル環境で直接アプリを起動できます。

### 1. 依存関係のインストール

プロジェクトルートで以下のコマンドを実行します。

```bash
pnpm install
```

### 2. アプリの起動（Turborepo）

Turborepo を使用して、API と Web フロントエンドを並列で起動します。

```bash
pnpm dev
```

デスクトップ版（Electron）も同時に起動する場合は、`--native` フラグを付与します。

```bash
pnpm dev --native
```

- **Web UI**: [http://localhost:5173](http://localhost:5173)
- **API**: [http://localhost:3000](http://localhost:3000)
- **Drizzle Studio**: [pnpm -F database db:studio](pnpm -F database db:studio) (DB の中身をブラウザで見れます)

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

### 7. ビルドとキャッシュ

Turborepo により、プロジェクト全体のビルド、リンター、テストが高速化（キャッシュ）されます。

```bash
pnpm build
pnpm check
pnpm test
```

一度実行したタスクは、ファイルに変更がない限りキャッシュから瞬時に結果が返されます。
