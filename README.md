# 漁市場デジタル台帳

水揚げ・売上・請求管理システム（Phase 1）

## 技術スタック

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Prisma ORM
- NextAuth.js
- shadcn/ui
- React Hook Form + Zod

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数の設定:
`.env.example` をコピーして `.env` を作成し、データベース接続情報を設定してください。

```bash
cp .env.example .env
```

3. データベースのセットアップ:
```bash
npx prisma migrate dev --name init
```

4. 開発サーバーの起動:
```bash
npm run dev
```

## プロジェクト構成

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 認証関連ページ
│   │   └── login/           # ログインページ
│   ├── (dashboard)/         # ダッシュボードレイアウト
│   │   ├── page.tsx         # ダッシュボード
│   │   ├── landings/        # 水揚げ管理
│   │   ├── sales/           # 売上管理
│   │   └── invoices/        # 請求管理
│   └── api/                 # API Routes
│       ├── auth/            # NextAuth
│       ├── landings/        # 水揚げAPI
│       └── suppliers/       # 仕入先API
├── components/              # Reactコンポーネント
│   ├── ui/                  # shadcn/ui コンポーネント
│   ├── sidebar.tsx          # サイドバー
│   ├── header.tsx           # ヘッダー
│   └── landing-form.tsx     # 水揚げ登録フォーム
├── lib/                     # ユーティリティ
│   ├── prisma.ts            # Prisma Client
│   ├── auth.ts              # NextAuth設定
│   └── utils.ts             # 汎用関数
└── types/                   # TypeScript型定義
    └── index.ts
```

## データベーススキーマ

### モデル一覧

- **User**: ユーザー（認証）
- **Supplier**: 仕入先
- **Landing**: 水揚げ情報
- **Buyer**: 買受人
- **Sale**: 売上
- **Invoice**: 請求書

詳細は `prisma/schema.prisma` を参照してください。

## 機能

### Phase 1で実装済み

- ✅ ログイン画面（NextAuth認証）
- ✅ ダッシュボードレイアウト（サイドバー付き）
- ✅ 水揚げ一覧ページ
- ✅ 水揚げ新規登録フォーム
- ✅ 売上管理ページ（枠のみ）
- ✅ 請求管理ページ（枠のみ）

## スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバー起動
- `npm run lint` - ESLint実行

## 注意事項

- データベースは PostgreSQL を使用
- 初回起動前に Prisma マイグレーションの実行が必要
- 環境変数 `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` の設定が必要
