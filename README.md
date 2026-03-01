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
# 取得 + 画像DL + cards_packed.json 生成
npm run scrape

# 取得 + 画像DL
npm run scrape:fetch

# cards.json から cards_packed.json 生成
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

## 移行実装メモ

- 画面エントリは `app/page.tsx` -> `app/client.tsx` -> `legacy/App.jsx`。
- 既存ロジックは `legacy/` に移植。
- カードデータは `app/api/cards/route.ts` 経由で読み込み。
  - 優先: `../gcg_deckmaker/public/cards_packed.json`
  - 次点: `../gcg_deckmaker/src/data/cards.json`
  - 最後: `public/cards_packed.json`
