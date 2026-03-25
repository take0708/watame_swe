# TASK-04: MenuScene 実装

## 概要
ゲームのスタート画面を実装する。スタートボタン押下でプレイヤーの初期状態を生成し、GameScene へ遷移する。

## 対象ファイル
- `src/scenes/MenuScene.js`

## 実装内容

### クラス定義
```js
export default class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    create() { ... }
}
```

### create() の内容

#### 背景
- `this.add.image(400, 300, 'bg')` で背景を配置。

#### タイトルテキスト
- `this.add.text(400, 180, 'わためは悪くないよねぇ', { fontSize: '28px', fill: '#ffffff' }).setOrigin(0.5)`
- サブタイトル: `'デッキ構築型マインスイーパ'` を小さいフォントで表示。

#### スタートボタン
- `this.add.text(400, 340, 'START', { fontSize: '36px', fill: '#ffdd00' }).setOrigin(0.5).setInteractive()`
- `pointerover` / `pointerout` でホバー色変化。
- `pointerdown` でゲーム開始処理を呼び出す。

#### ゲーム開始処理
プレイヤーの初期状態オブジェクトを生成し、GameScene に渡す:
```js
const playerState = {
    stage: 1,
    hp: 1,
    hand: [],   // CardManager が管理する手札（Card オブジェクト配列）
};
this.scene.start('GameScene', { playerState });
```

### main.js への MenuScene 登録

`src/scenes/MenuScene.js` 作成後、`src/main.js` を以下のように更新する:
```js
import BootScene  from './scenes/BootScene.js';
import MenuScene  from './scenes/MenuScene.js';
// （GameScene, UIScene は後続タスクで追加）
const config = {
    ...
    scene: [BootScene, MenuScene, /* GameScene, UIScene */],
};
```

## 完了条件
- メニュー画面が表示され、START ボタン押下で GameScene へ遷移する。
- playerState が GameScene の `this.scene.settings.data` 経由で受け取れる。
- `src/main.js` に `MenuScene` が import・登録されている。

## 依存タスク
- TASK-03
