# TASK-12: UIScene 手札UI実装

## 概要
GameScene と並行して動作する `UIScene` を実装し、手札カードの常時表示とカード使用UIを提供する。

## 対象ファイル
- `src/scenes/UIScene.js`

## 実装内容

### クラス定義
```js
export default class UIScene extends Phaser.Scene {
    constructor() { super('UIScene'); }
    create()  { ... }
    refresh() { ... }  // 手札が変化するたびに GameScene から呼び出す
}
```

### シーン起動
GameScene の `create()` 内で並行起動する:
```js
this.scene.launch('UIScene', { cardManager: this.cardMgr, board: this.board });
```

UIScene の `create()` で受け取る:
```js
create(data) {
    this.cardMgr = data.cardManager;
    this.board   = data.board;
    ...
}
```

---

### 手札エリアのレイアウト

#### 配置
- 画面下部（y: 520〜590）に横一列で4枚分のカードスロットを配置。
- スロット間隔: 160px、中央寄せ。

#### 各カードスロット
- 枠画像 `card_ui_frame` を背景に配置。
- カードが存在する場合:
  - カード名テキストを枠内に表示。
  - スロット全体を `setInteractive()` でクリック可能にする。
  - `pointerover` でスロットをハイライト（alpha: 0.7 → 1.0）。
  - **左クリック** (`pointerdown`) で `_onCardClick(index)` を呼び出す。
  - **右クリック** (`rightdown`) で `_onCardDiscard(index)` を呼び出す。
- カードが存在しない場合:
  - テキストを「---」で表示、インタラクションを無効化。

#### `refresh()`
`cardMgr.hand` の現在状態を読み取り、全スロットのテキストとインタラクションを更新する。

---

### `_onCardClick(index)`
クリックされたカードに応じて使用処理を開始する。

#### ロジック
1. `cardMgr.hand[index]` のカードIDを確認。
2. **マインムーブ** の場合:
   - GameScene に「地雷選択モード」に入るよう通知（`scene.get('GameScene').enterMineMoveMode(index)`）。
3. **その他のカード** の場合:
   - `cardMgr.useCard(index, this.board, this)` を直接呼び出す（`this.board` は `create(data)` で受け取った参照）。
   - `this.scene.get('GameScene')._updateCells(changedCells)` で盤面を再描画する。
4. `refresh()` を呼び出してUIを更新。

---

### `_onCardDiscard(index)`
手札カードを任意のタイミングで破棄する。

#### ロジック
1. `cardMgr.hand[index]` が存在しなければ何もしない。
2. 確認ダイアログを表示:
   - 「{カード名} を破棄しますか？」テキストと「YES」「NO」ボタンを画面中央にモーダル表示。
   - **UIが表示中はゲーム入力を無効化する**（`this.scene.get('GameScene').input.enabled = false/true`）。
3. 「YES」選択時:
   - `cardMgr.removeCard(index)` でカードを破棄。
   - `refresh()` を呼び出してUIを更新。
4. 「NO」選択時: 何もせずモーダルを閉じる。
5. いずれの選択後も Container を `destroy()` で破棄し、ゲーム入力を再有効化する。

> **注意**: 右クリックメニューが表示されないよう `this.input.mouse.disableContextMenu()` は GameScene 側で呼び出し済みのため、UIScene では追加対応不要。

---

### ステージ情報表示
手札エリアの右上などにステージ情報を常時表示:
- `STAGE: {n}` テキスト（白、14px）。
- `GameScene` のステージ変更時に更新。

---

## 完了条件
- ゲーム中、手札カードが常に画面下部に表示される。
- 左クリックでカードが使用され、手札から消える。
- 右クリックで確認モーダルが表示され、YES で手札からカードが破棄される。
- 手札が変化するたびにUIが即時更新される。
- マインムーブ選択時、GameScene の選択モードが正しく起動する。
- 破棄確認UI表示中はゲーム盤面への入力が無効化される。
- `src/main.js` に `UIScene` が正しく import・登録されている。

## 依存タスク
- TASK-09
- TASK-10
