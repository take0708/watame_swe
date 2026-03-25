# TASK-02: 定数・ユーティリティ定義

## 概要
ゲーム全体で参照するステージ定数・カード定義・ヘルパー関数を `utils/` にまとめる。

## 対象ファイル
- `src/utils/constants.js`
- `src/utils/helpers.js`

## 実装内容

### src/utils/constants.js

#### STAGES 配列
各インデックスがステージ番号（0始まり）に対応するオブジェクトの配列:

```js
export const STAGES = [
    { level: 1, cols: 9,  rows: 9,  mines: 10, cards: 2, jamRate: 0.00 },
    { level: 2, cols: 12, rows: 12, mines: 20, cards: 3, jamRate: 0.05 },
    { level: 3, cols: 15, rows: 15, mines: 35, cards: 4, jamRate: 0.10 },
    { level: 4, cols: 18, rows: 18, mines: 55, cards: 6, jamRate: 0.15 },
    { level: 5, cols: 22, rows: 22, mines: 85, cards: 8, jamRate: 0.20 },
];
```

#### CARDS オブジェクト
カードID をキー、カード定義を値とするオブジェクト:

```js
export const CARDS = {
    MINE_SEARCH_1: { id: 'MINE_SEARCH_1', name: 'マインサーチ1', count: 1 },
    MINE_SEARCH_3: { id: 'MINE_SEARCH_3', name: 'マインサーチ3', count: 3 },
    REVIVE:        { id: 'REVIVE',        name: 'リヴァイブ',    passive: true },
    MINE_MOVE:     { id: 'MINE_MOVE',     name: 'マインムーブ',  targeted: true },
};
```

#### その他定数
```js
export const MAX_HAND_SIZE = 4;
export const CELL_SIZE = 32; // px
```

### src/utils/helpers.js

#### `clamp(value, min, max)`
値を min〜max の範囲に収める。

#### `shuffleArray(array)`
Fisher-Yates アルゴリズムで配列をインプレースシャッフルし返す。

#### `getNeighbors(x, y, cols, rows)`
座標 (x, y) の周囲8マスのうち盤面内に収まる座標リスト `[{x, y}, ...]` を返す。

## 完了条件
- `import { STAGES, CARDS, MAX_HAND_SIZE } from './utils/constants.js'` が他ファイルで正常に動作する。
- `getNeighbors` が盤面端でも正しくフィルタリングされた座標を返す。

## 依存タスク
- TASK-01
