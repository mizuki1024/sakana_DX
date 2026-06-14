# 環境構築・デプロイ手順書

漁市場デジタル台帳システムのセットアップ手順です。

## 前提条件

- Node.js 18以上
- PostgreSQLデータベース（Supabase推奨）
- Vercelアカウント（本番デプロイ用）

---

## ローカル開発環境

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd my-new-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. データベースのセットアップ

```bash
# スキーマをDBに反映
npx prisma db push

# Prisma Clientを生成
npx prisma generate

# サンプルデータを投入
npx prisma db seed
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能。

---

## Supabaseの設定

### 1. プロジェクト作成

1. https://supabase.com にログイン
2. 「New Project」をクリック
3. プロジェクト名とパスワードを設定
4. リージョンは「Northeast Asia (Tokyo)」を選択

### 2. 接続情報の取得

1. Settings → Database に移動
2. 「Connection string」セクションを確認
3. URI形式の接続文字列をコピー
4. `[YOUR-PASSWORD]` を実際のパスワードに置換

### 3. 接続プールの設定

Prismaで使用する場合:
- `DATABASE_URL`: Session pooler（ポート5432、?pgbouncer=true付き）
- `DIRECT_URL`: Direct connection（ポート5432、pgbouncer無し）

---

## Vercelへのデプロイ

### 1. Vercelプロジェクトの作成

1. https://vercel.com にログイン
2. 「Add New」→「Project」
3. GitHubリポジトリを接続
4. フレームワークは「Next.js」が自動検出される

### 2. 環境変数の設定

Vercelプロジェクト設定で以下を追加:

| 変数名 | 値 |
|--------|-----|
| DATABASE_URL | Supabaseの接続文字列 |
| DIRECT_URL | Supabaseの直接接続文字列 |
| NEXTAUTH_SECRET | ランダムな秘密鍵 |
| NEXTAUTH_URL | https://your-domain.vercel.app |

秘密鍵の生成:
```bash
openssl rand -base64 32
```

### 3. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待機
3. 割り当てられたURLでアクセス確認

### 4. データベース初期化

デプロイ後、Vercelのターミナルまたはローカルから:

```bash
# 本番DBにスキーマを反映
npx prisma db push

# 初期データを投入
npx prisma db seed
```

---

## 本番環境チェックリスト

### セキュリティ

- [ ] NEXTAUTH_SECRETが十分に長いランダム文字列である
- [ ] DATABASE_URLが外部に漏れていない
- [ ] .envファイルがgitignoreに含まれている

### データベース

- [ ] Supabaseのバックアップが有効になっている
- [ ] 接続プールが正しく設定されている
- [ ] Row Level Security (RLS) の検討（将来）

### アプリケーション

- [ ] 本番URLでログインできる
- [ ] 水揚げ登録→売上登録→請求書作成の流れが動作する
- [ ] CSV出力が正常に動作する
- [ ] 印刷プレビューが正常に表示される

### 運用

- [ ] 管理者アカウントが作成されている
- [ ] スタッフアカウントが作成されている
- [ ] エラー時の連絡先が明確である

---

## トラブルシューティング

### Prismaエラー: P1001

接続できない場合:
- DATABASE_URLが正しいか確認
- Supabaseプロジェクトが起動しているか確認
- IPアドレス制限がないか確認

### ビルドエラー: Module not found

```bash
npm install
npx prisma generate
```

### 認証エラー: NEXTAUTH_URL mismatch

- NEXTAUTH_URLが実際のアクセスURLと一致しているか確認
- Vercelの環境変数を更新後、再デプロイが必要

### データベースマイグレーション

スキーマを変更した場合:
```bash
# 開発環境
npx prisma db push

# 本番環境（慎重に）
npx prisma migrate deploy
```

---

## バックアップと復旧

### Supabaseの自動バックアップ

- Proプラン: 7日間の自動バックアップ
- 復旧はダッシュボードから実行可能

### 手動バックアップ

```bash
# データをエクスポート
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 復旧手順

1. Supabaseダッシュボードにログイン
2. Database → Backups
3. 復旧したい時点を選択
4. 「Restore」を実行

---

## 顧客環境へのPoC導入

### 初期設定の流れ

1. Supabaseで新規プロジェクト作成
2. Vercelで新規プロジェクト作成・デプロイ
3. 環境変数を設定
4. `npx prisma db push` でスキーマ反映
5. 管理者アカウントを作成
6. 顧客のマスタデータ（仕入先・買受人）を登録
7. テスト運用を開始

### 顧客別カスタマイズ

- 帳票レイアウト: `src/app/(dashboard)/` 配下を調整
- 魚種リスト: 固定リストまたはマスタ化を検討
- 手数料率: 将来的に設定画面を追加
