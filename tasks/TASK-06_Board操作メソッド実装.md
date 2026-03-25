# TASK-06: Board.js 操作メソッド実装（reveal / moveMine）

## 概要
`Board` クラスに、セル開封と地雷移動の主要メソッドを追加する。

## 対象ファイル
- `src/entities/Board.js`（TASK-05 の続き）

## 実装内容

### `reveal(x, y): Cell[]`
指定座標を開封し、変化したセルのリストを返す（GameScene が描画更新に使用）。

#### ロジック
1. 座標が盤面外 / すでに開封済み / 旗立て済みなら即 return `[]`。
2. `cell.isRevealed = true`、`this.revealedCount++`。
3. 返却リストに当該セルを追加。
4. `cell.neighborMines === 0` かつ `cell.isMine === false` なら、周囲8マスに対して再帰的に `reveal()` を呼び出し、結果をマージ。
5. 最終的に変化したセルの配列を返す。

#### 注意
- 再帰時に無限ループを防ぐため、`isRevealed` のチェックが必須。

### `flag(x, y): boolean`
旗の立て外しをトグルし、状態変化の成否を返す。

#### ロジック
1. 開封済みセルは何もしない（return false）。
2. `isFlagged` をトグル。
3. `flaggedCount` を +1 / -1。
4. return true。

### `moveMine(fromX, fromY): {from: Cell, to: Cell} | null`
指定座標の地雷を、未開封かつ非地雷の別マスへランダムに移動する。

#### ロジック
1. 対象セルが地雷でなければ return null。
2. 移動先候補 = `isMine === false && isRevealed === false` のセルリスト。
3. 候補がなければ return null。
4. 候補からランダムに1マス選択、地雷フラグを移動（`from.isMine = false`, `to.isMine = true`）。
5. `from` の `neighborMines` と、`from` / `to` の周囲全セルの `neighborMines` を再計算。
6. `{from, to}` を返す（GameScene が再描画に使用）。

### `isCleared(): boolean`
非地雷セルがすべて開封済みなら true を返す。

```js
isCleared() {
    return this.revealedCount === (this.cols * this.rows - this.mineCount);
}
```

## 完了条件
- `reveal` が数字0セルで周囲を再帰的に開封し、変化セルリストを正しく返す。
- `moveMine` 後に全セルの `neighborMines` が整合している。
- `isCleared` が正しいタイミングで true を返す。

## 依存タスク
- TASK-05
