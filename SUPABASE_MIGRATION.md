# Supabase Migration Guide

`localStorage` から Supabase 保存へ切り替えるための最短手順。

## 1. Supabase 側を作成

1. Supabase プロジェクトを作成
2. SQL Editor で `supabase/schema.sql` を実行

## 2. 環境変数を設定

`.env.local` を作成し、以下を設定:

```bash
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
SUPABASE_CARDS_BUCKET=gcg-data
SUPABASE_CARD_IMAGES_BUCKET=gcg-card-images
CRON_SECRET=...
# (legacy fallback)
# SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STORAGE_MODE=supabase
```

- `NEXT_PUBLIC_STORAGE_MODE=local` なら従来の localStorage を使います
- `NEXT_PUBLIC_STORAGE_MODE=supabase` で API 経由保存に切り替わります

## 3. 実装済み API

- `GET /api/users`
- `POST /api/users`
- `DELETE /api/users/:id`
- `GET /api/decks`
- `POST /api/decks`
- `DELETE /api/decks/:id`
- `POST /api/decks/:id/copy`
- `POST /api/decks/:id/rename`
- `POST /api/decks/:id/export-public`
- `POST /api/decks/:id/import-public`
- `GET /api/scrape/run` (Vercel Cron 用)

## 4. Supabase Storage バケット

- カードJSON用: `SUPABASE_CARDS_BUCKET`（既定値 `gcg-data`）
- カード画像用: `SUPABASE_CARD_IMAGES_BUCKET`（既定値 `gcg-card-images`）
- 事前に2つのバケットを作成してください（画像バケットは公開推奨）
- `/api/scrape/run` 実行時:
  - `cards.json` をカードJSON用バケットに保存
  - カード画像を画像バケットへ差分アップロード
  - `cards.json` の `image` URL は Supabase Storage の公開URLへ置換

## 5. 初回シード

`app_users` / `decks` が空のとき、以下から初期データを投入します:

- `public/initial_users.json`
- `public/initial_decks.json`

## 6. 定期実行（任意）

- `CRON_SECRET` を設定すると `/api/scrape/run` の Bearer 認証が有効になります。
- Freeプラン運用などで定期実行を使わない場合、`vercel.json` の `crons` は空で問題ありません。

## 7. 注意点

- いまは `secret key`（または legacy `service role`）を Next API から使うサーバーアクセス前提です
- 直接クライアントアクセス + RLS は次フェーズで追加する想定です
- 現在のデッキ構造（`cards`, `iconCards`）は互換優先で `jsonb` 保存です
