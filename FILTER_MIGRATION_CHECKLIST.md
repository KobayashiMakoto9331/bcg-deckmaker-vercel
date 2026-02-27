# Card Filter Migration Checklist

`gcg_deckmaker/src/components/CardGrid.jsx` の仕様を  
`gcg-deckmaker-next/components/feature/card-grid.jsx` に戻すための復旧チェックリスト。

## 0. スコープ固定

- [ ] 対象ファイルを固定
  - `components/feature/card-grid.jsx`
  - `components/feature/multi-select-dropdown.jsx`
  - 参照: `legacy/data/filterConfig.json`
- [ ] 「UIはTailwind優先」「`components/ui` の見た目を壊さない」を維持
- [ ] Phase 1 では仕様互換を優先（最適化は後回し）

## 1. フィルター状態を復元

- [ ] `card-grid.jsx` に以下 state を追加
  - `activeColors`
  - `activeTypes`
  - `filterFeatures`
  - `filterLinks`
  - `filterSources`
  - `filterObtains`
  - `filterTerrains`
  - `filterSets`
  - `filterLevels`
  - `filterCosts`
  - `filterAPs`
  - `filterHPs`
  - `filterRarities`
  - `filterAbilities`
  - `showFoil`
- [ ] `clearAllFilters` で全条件をリセットできるようにする

## 2. フィルター候補データ生成を復元

- [ ] `effectiveRarityMap`（Pレア補正ロジック）を復元
- [ ] `cards` から候補群を `useMemo` で抽出
  - `features`, `links`, `sources`, `obtains`, `terrains`, `sets`
  - `levels`, `costs`, `aps`, `hps`, `rarities`
- [ ] `filterConfig.setFilter.includeKeywords / excludeKeywords` を使った `sets` 抽出を復元
- [ ] 数値候補は数値ソート、レアリティは専用順序でソート

## 3. 絞り込みロジックを復元

- [ ] 現行のテキスト検索（名前・ID・本文）は維持
- [ ] 色フィルターを復元（`stats["色"]`）
- [ ] タイプフィルターを復元（`stats["タイプ"]`）
- [ ] 特殊条件を復元  
  - 本文に `【パイロット】「` を含む場合、`PILOT` としても判定
- [ ] 文字列系絞り込みを復元
  - 特徴 / リンク / 出典 / 入手
- [ ] 数値系絞り込みを復元
  - Lv. / COST / AP / HP
- [ ] レアリティ絞り込みを復元（`effectiveRarityMap` 使用）
- [ ] 能力絞り込みを復元  
  - `filterConfig.abilities` の `label -> query` 変換を使用
- [ ] Foil 表示トグルを復元  
  - `showFoil` false 時は `foilFilter.excludeKeywords` を除外
- [ ] 地形絞り込みを復元（分割判定）
- [ ] 収録弾絞り込みを復元（`入手情報` 一致）

## 4. ソート仕様を復元

- [ ] sort options を復元
  - `ID`, `Lv.`, `COST`, `AP`, `HP`, `Rarity`, `Color`
- [ ] `Rarity` ソートを専用順序で実装（`L > LR > SR > R > U > C > ST > P`）
- [ ] `Color` ソートを専用順序で実装（旧実装順を踏襲）
- [ ] 不正値（`-`, undefined など）時の退避順序を旧仕様に合わせる

## 5. フィルターパネルUIを復元

- [ ] フィルターモーダルに以下を配置
  - 検索入力
  - 色トグル
  - タイプトグル
  - Sort key / 昇降順
  - グリッド列数トグル（4列/8列）
  - Show Foil トグル
  - 12個の `MultiSelectDropdown`
- [ ] `Clear All` と `Close` ボタンを復元
- [ ] `MultiSelectDropdown` で複数選択、全選択、全解除が動作

## 6. 表示・操作の互換確認

- [ ] `Showing N cards` が絞り込み件数と一致
- [ ] 絞り込み後でも枚数設定（0-4）ボタンが正しく動作
- [ ] カード詳細プレビューが開ける
- [ ] 4列/8列でレイアウト崩れなし

## 7. 受け入れテスト（最小）

- [ ] 色=`Blue` で青カードのみ表示
- [ ] タイプ=`PILOT` で dual pilot 判定を含めて表示
- [ ] Lv/COST/AP/HP の複合指定で絞り込みできる
- [ ] 能力フィルターが `filterConfig` の query 文字列で反映
- [ ] `showFoil` off で foil を除外、on で表示
- [ ] `Rarity` と `Color` ソートが旧順序で並ぶ
- [ ] `Clear All` で全条件が初期化される

## 8. 完了条件

- [ ] 旧 `CardGrid.jsx` の主要フィルター機能が同等に利用可能
- [ ] `npm run build` 成功
- [ ] lint エラーなし（警告は別タスクで管理可）
- [ ] 目視確認でフィルターパネルの操作フローが旧版同等
