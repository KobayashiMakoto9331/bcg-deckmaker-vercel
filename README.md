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

## 移行実装メモ

- 画面エントリは `app/page.tsx` -> `app/client.tsx` -> `legacy/App.jsx`。
- 既存ロジックは `legacy/` に移植。
- カードデータは `app/api/cards/route.ts` 経由で読み込み。
  - 優先: `../gcg_deckmaker/public/cards_packed.json`
  - 次点: `../gcg_deckmaker/src/data/cards.json`
  - 最後: `public/cards_packed.json`
