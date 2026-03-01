# GCG Deckmaker (Next.js)

Next.js(App Router) への移行版です。

## 開発起動

```bash
npm run dev
```

`http://localhost:3000` を開いてください。

## ビルド

```bash
npm run build
```

## スクレイピング

```bash
# 取得 + 画像DL + cards_packed.json 生成（ローカル用）
npm run scrape

# 取得 + 画像DL（ローカル用）
npm run scrape:fetch

# cards.json から cards_packed.json 生成（ローカル用）
npm run pack-images

# 定期実行（00:00 / 06:00 / 12:00 / 18:00）
npm run scrape:auto
```

生成物:

- `public/cards.json`
- `public/cards_packed.json`
- `public/images/cards/*`

補足:

- 差分取り込みは `scripts/scrape_full.mjs` のIDマージ（新規/更新判定）と、
  `scripts/download_images.mjs` の既存画像スキップで実装しています。
- 定期実行のログ出力は `scripts/job_scrape.mjs` 経由で `update.log` に記録されます。

## API スクレイピング（Supabase保存）

- `/api/scrape/run` はカードをスクレイプし、Supabase Storage に以下を保存します。
  - `cards.json`（`SUPABASE_CARDS_BUCKET`）
  - カード画像（`SUPABASE_CARD_IMAGES_BUCKET` の `cards/*`）
- `cards.json` の `image` URL は Supabase Storage の公開URLへ置換されます。
- `/api/cards` は Supabase Storage の `cards.json`（存在すれば）を返します。
- Vercel Freeプラン運用時は `vercel.json` の `crons` を空にして手動実行で運用できます。

## 移行実装メモ

- 画面エントリは `app/page.tsx` -> `app/client.tsx` -> `legacy/App.jsx`。
- 既存ロジックは `legacy/` に移植。
- カードデータは `app/api/cards/route.ts` 経由で読み込み。
  - 優先: Supabase Storage の `cards.json`
  - 次点: `../gcg_deckmaker/src/data/cards.json`
  - 最後: `public/cards.json`
