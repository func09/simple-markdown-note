# simplenote-clone

## 開発環境の起動

Docker を用いて、API と Web フロントエンドを一括で起動できます。

### 1. コンテナの起動
```bash
docker compose up -d --build
```

### 2. 各サービスへのアクセス
- **Web UI**: [http://localhost:5173](http://localhost:5173)
- **API**: [http://localhost:3000](http://localhost:3000)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555) (DB の中身をブラウザで見れます)

### 3. テストの実行 (API)
起動中のコンテナ内で API のテストを実行できます。
```bash
docker compose exec api npm run test -w apps/api
```

### 4. データベースの初期化・同期
初回起動時やスキーマ変更時には、以下のコマンドでデータベースを同期してください。
```bash
docker compose exec api sh -c "cd packages/database && npx prisma db push"
```

