# TASK-08: CardManager.js 手札管理・カード獲得実装

## 概要
手札の保持・上限管理・カード獲得時の交換UIを実装する。カード効果の実行は TASK-09 で扱う。

## 対象ファイル
- `src/entities/CardManager.js`

## 実装内容

### クラス定義
```js
export default class CardManager {
    constructor(scene) {
        this.scene = scene;
        this.hand = [];  // 最大 MAX_HAND_SIZE 枚
    }
}
```

### `addCard(cardId): void`
新しいカードを手札に加える処理。

#### ロジック
1. `this.hand.length < MAX_HAND_SIZE` なら `this.hand.push({ id: cardId })` して終了。
2. 手札が満杯（4枚）の場合、**交換UI** を表示する:
   - 現在の手札4枚を一覧表示し、「どれかと交換するか、新カードを捨てるか」を選択させる。
   - 選択肢: 手札の各カード（クリックで交換）+ 「捨てる」ボタン。
   - 選択後、UI を閉じる。

### `removeCard(index): Card | null`
指定インデックスのカードを手札から取り出して返す（効果発動前の取り出しに使用）。

```js
removeCard(index) {
    if (index < 0 || index >= this.hand.length) return null;
    return this.hand.splice(index, 1)[0];
}
```

### `hasRevive(): boolean`
手札に「リヴァイブ」カードが存在するかを返す。

```js
hasRevive() {
    return this.hand.some(c => c.id === 'REVIVE');
}
```

### `consumeRevive(): void`
手札から「リヴァイブ」を1枚消費する（最初に見つかった1枚を削除）。

### 交換UI の詳細
- Phaser の Container を使い、画面上部または中央にモーダル風に表示。
- 手札カード4枚を横並びで表示（カード名テキスト + 枠画像）。
- 各カードと「捨てる」ボタンは `setInteractive()` でクリック検知。
- クリック後、Container を `destroy()` で破棄し、GameScene に選択結果を通知。
- **UIが表示中はゲーム入力を無効化する**（`scene.input.enabled = false/true`）。

## 完了条件
- 手札4枚未満の状態でカードが自動追加される。
- 手札4枚の状態でカードを取得すると交換UIが表示される。
- 交換・破棄後に手札が正しく更新される。
- `hasRevive` / `consumeRevive` が正しく動作する。

## 依存タスク
- TASK-02
