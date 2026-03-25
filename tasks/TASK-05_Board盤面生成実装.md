# TASK-05: Board.js 盤面生成ロジック実装

## 概要
盤面を表す `Board` クラスを実装する。Cell オブジェクトの2次元配列を生成し、地雷・カードマス・neighborMines を初期化する。

## 対象ファイル
- `src/entities/Board.js`

## 実装内容

### Cell オブジェクト構造
```js
{
    x: number,          // 列インデックス
    y: number,          // 行インデックス
    isMine: boolean,
    isCard: boolean,
    cardId: string | null,  // CARDS の id キー
    isRevealed: boolean,
    isFlagged: boolean,
    neighborMines: number
}
```

### クラス定義
```js
export default class Board {
    constructor(cols, rows, mineCount, cardCount) { ... }
}
```

### constructor 内の生成ロジック

#### Step 1: 配列初期化
- `cols × rows` の2次元配列 `this.grid` を生成。
- 全セルを上記プロパティのデフォルト値（false/null/0）で初期化。

#### Step 2: 地雷配置
- `mineCount` 個の座標をランダムに選択（重複なし）。
- 対象セルの `isMine = true` を設定。
- `shuffleArray` + `slice` を使った効率的な実装を推奨。

#### Step 3: カードマス配置
- `isMine === false` のセルを候補リストとして抽出。
- 候補からランダムに `cardCount` 個を選択。
- 利用可能カード種（CARDS のキー）からランダムに `cardId` を割り当て。
- `isCard = true` を設定。

#### Step 4: neighborMines 計算
- 全セルを走査。
- `isMine === false` のセルについて `getNeighbors(x, y, cols, rows)` で隣接セルを取得。
- 隣接セルのうち `isMine === true` の個数を `neighborMines` に設定。

### プロパティ
- `this.grid`: Cell[][] — 盤面データ
- `this.cols`, `this.rows`: 盤面サイズ
- `this.mineCount`: 総地雷数
- `this.flaggedCount`: 現在の旗の数（初期値 0）
- `this.revealedCount`: 開封済みセル数（初期値 0）

## 完了条件
- `new Board(9, 9, 10, 2)` で地雷10個・カード2個の盤面が生成される。
- `neighborMines` が全セルで正しく計算されている（手動確認 or console.log）。
- 地雷セルに `isCard` が立たない。

## 依存タスク
- TASK-02
