# TASK-10: GameScene 盤面描画・入力処理実装

## 概要
`GameScene` のメインロジックを実装する。盤面の描画・更新、クリック入力の処理、ジャミング・カード連携を担う。

## 対象ファイル
- `src/scenes/GameScene.js`

## 実装内容

### クラス定義
```js
export default class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }
    init(data)   { ... }
    create()     { ... }
    update()     { ... }
}
```

---

### `init(data)`
MenuScene から渡された `playerState` を受け取り保持する。

```js
this.playerState = data.playerState;
this.currentStage = STAGES[this.playerState.stage - 1];
```

---

### `create()`

#### インスタンス生成
```js
this.board   = new Board(cols, rows, mines, cards);
this.jamming = new Jamming(this);
this.cardMgr = new CardManager(this);

// ステージクリア後の手札引き継ぎ（初回起動時は hand: [] のため空ループ）
this.playerState.hand.forEach(card => this.cardMgr.hand.push(card));
```

#### 盤面描画（初期）
- `_drawBoard()` メソッドを呼び出し、全セルを `cell_hidden` スプライトで描画。
- Phaser の `Group` または `Container` でセルスプライトを管理。
- セルスプライト配置: 左上起点、`CELL_SIZE` ピクセル間隔でグリッド配置。
- 盤面全体を画面中央に寄せるオフセットを計算して適用。

#### 入力設定
- `this.input.on('pointerdown', this._onPointerDown, this)` を登録。
- 右クリックで旗立て: `this.input.mouse.disableContextMenu()` を呼び出してブラウザの右クリックメニューを無効化。

#### BGM 再生
- `this.sound.play('bgm', { loop: true })`

---

### `_onPointerDown(pointer)`
クリック座標をセルインデックスに変換し、左右クリックで処理を分岐。

```
gridX = Math.floor((pointer.x - offsetX) / CELL_SIZE)
gridY = Math.floor((pointer.y - offsetY) / CELL_SIZE)
```

- 盤面外クリックは無視。
- **左クリック**: `_handleOpen(gridX, gridY)` を呼び出す。
- **右クリック** (`pointer.rightButtonDown()`): `_handleFlag(gridX, gridY)` を呼び出す。

---

### `_handleOpen(x, y)`
1. `Jamming.resolve(x, y, jamRate, cols, rows)` で実際の開封座標を決定。
2. `board.reveal(x', y')` を呼び出す。
3. 開封セルが地雷の場合:
   - `cardMgr.triggerRevive()` が true → ゲーム継続（セルを `cell_mine` で表示するが爆発処理は行わない）。
   - false → `_onGameOver()` を呼び出す。
4. 変化セルリストを `_updateCells(changedCells)` で再描画。
5. カードマスを開封した場合: `cardMgr.addCard(cell.cardId)` を呼び出す。
6. `board.isCleared()` が true なら `_onStageClear()` を呼び出す。

---

### `_handleFlag(x, y)`
`board.flag(x, y)` を呼び出し、当該セルのスプライトを `cell_flag` / `cell_hidden` に切り替える。

---

### `enterMineMoveMode(cardIndex)`
UIScene からマインムーブカード使用時に呼び出される。GameScene を「地雷選択モード」に切り替える。

#### ロジック
1. `this.mineMoveCardIndex = cardIndex` を保存し、`this.isMineMoveMode = true` フラグを立てる。
2. `_onPointerDown` 内で `isMineMoveMode === true` の場合の分岐を追加:
   - クリックされたセルが `isMine === false` なら何もしない（モード継続）。
   - クリックされたセルが `isMine === true` なら:
     1. `cardMgr.useCard(this.mineMoveCardIndex, this.board, this.scene.get('UIScene'))` を呼び出す。
     2. `isMineMoveMode = false` でモードを解除。
3. ESC キーでキャンセル（`this.input.keyboard.on('keydown-ESC', ...)`）:
   - `isMineMoveMode = false` に戻す。
   - カードを手札に戻す（`cardMgr.hand.splice(this.mineMoveCardIndex, 0, { id: 'MINE_MOVE' })`）。
   - UIScene の `refresh()` を呼ぶ。

---

### `_drawBoard()` / `_updateCells(cells)`
- `_drawBoard()`: 初期描画。全セルスプライトを生成しグリッドに配置。スプライトは `this.cellSprites[y][x]` で参照できる2次元配列に格納。
- `_updateCells(cells)`: 変化したセルのみテクスチャを更新。

#### セルのテクスチャ選択ルール
| 状態 | テクスチャキー |
| :--- | :--- |
| 未開封（通常） | `cell_hidden` |
| 未開封（カードマス） | `cell_card` |
| 旗 | `cell_flag` |
| 開封済み（数字 n） | `cell_0` 〜 `cell_8` |
| 開封済み（地雷） | `cell_mine` |

> **注意**: `isCard === true && isRevealed === false` のセルは `cell_card` で描画する。開封後は通常セルと同様に数字テクスチャを使用する。

---

## 完了条件
- ゲームが起動し、グリッドが正しい位置に描画される。
- 左クリックでセルが開封され、再帰的に空白が開く。
- 右クリックで旗が立て外しできる。
- カードマスが `cell_card` テクスチャで表示され、開封するとカードが追加される。
- `enterMineMoveMode` 呼び出し後、地雷セルのクリックで地雷移動が実行される。
- ステージクリア後の `scene.restart()` 時に、`playerState.hand` の内容が `cardMgr.hand` に復元される。
- `src/main.js` に `GameScene` が正しく import・登録されている。

## 依存タスク
- TASK-04
- TASK-06
- TASK-07
- TASK-08
