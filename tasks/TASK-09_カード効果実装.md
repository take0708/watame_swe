# TASK-09: カード効果実装（MineSearch / Revive / MineMove）

## 概要
各カードの効果ロジックを `CardManager` に実装する。効果は `GameScene` の `Board` インスタンスへ作用する。

## 対象ファイル
- `src/entities/CardManager.js`（TASK-08 の続き）

## 実装内容

### `useCard(index, board, uiScene): void`
手札のカードを使用する共通エントリポイント。

#### ロジック
1. `removeCard(index)` でカードを取り出す。
2. カードの `id` に応じてカード効果メソッドを呼び出す。
3. UIScene のカード表示を更新する。
4. `se_card` SEを再生する。

---

### マインサーチ1 / マインサーチ3

#### `_useMineSearch(board, count): Cell[]`
未開封かつ旗なしの地雷をランダムに `count` 個選び、旗を立てる。

```
対象候補 = grid の全セルのうち
    isMine === true && isRevealed === false && isFlagged === false
```

1. 候補を `shuffleArray` でシャッフル。
2. 先頭 `count` 個に対して `board.flag(x, y)` を呼び出す。
3. 旗を立てたセルリストを返す（GameScene が再描画に使用）。

---

### リヴァイブ（パッシブ）

リヴァイブは**使用するカードではなく、自動発動するパッシブ**。`CardManager.useCard` からは呼び出さない。

#### 発動タイミング（GameScene 側で検知）
- `board.reveal(x, y)` で地雷を踏んだとき（`cell.isMine === true`）。
- `this.cardManager.hasRevive()` が true であれば爆発を無効化。

#### `triggerRevive(): boolean`
```
1. hasRevive() が false なら return false。
2. consumeRevive() でカードを消費。
3. 演出: 「リヴァイブ発動！」テキストを画面に短時間表示。
4. return true。
```

---

### マインムーブ

#### `_useMineMove(board, targetX, targetY): {from, to} | null`
プレイヤーが選択したセルの地雷を別マスへ移動する。

1. **対象選択UI**: カード使用後、`GameScene` を「地雷選択モード」に切り替え、プレイヤーに地雷セルをクリックさせる。
   - セルにカーソルを当てると色変化でハイライト。
   - 地雷でないセルをクリックした場合は何もしない（モード継続）。
   - ESCキーでキャンセル（カードを手札に戻す）。
2. 地雷セルが選択されたら `board.moveMine(targetX, targetY)` を呼び出す。
3. 結果の `{from, to}` を GameScene へ渡して再描画する。

---

## 完了条件
- マインサーチ1/3 使用後、未開封地雷に旗が立つ。
- 地雷を踏んだとき、リヴァイブがあれば自動消費されゲームオーバーにならない。
- マインムーブ使用後、地雷が別マスへ移動し、数字表示が更新される。

## 依存タスク
- TASK-06
- TASK-08
