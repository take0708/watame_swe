# TASK-07: Jamming.js 実装

## 概要
プレイヤーのクリックを横取りし、確率的に座標をずらす「ジャミング」ロジックと演出を実装する。

## 対象ファイル
- `src/entities/Jamming.js`

## 実装内容

### クラス定義
```js
export default class Jamming {
    constructor(scene) {
        this.scene = scene; // GameScene の参照（演出に使用）
    }
}
```

### `resolve(x, y, jamRate, cols, rows): {x, y, jammed: boolean}`
クリック座標を受け取り、ジャミング判定後の実際の開封座標を返す。

#### ロジック
1. `Math.random() >= jamRate` ならジャミングなし → `{x, y, jammed: false}` を返す。
2. ジャミング発動時:
   - オフセット量 `dx`, `dy` をそれぞれ `[-3, -2, -1, 1, 2, 3]` の中からランダムに選択（0 を除く）。
   - `x' = clamp(x + dx, 0, cols - 1)`
   - `y' = clamp(y + dy, 0, rows - 1)`
   - `this._playEffect()` を呼び出す。
   - `{x: x', y: y', jammed: true}` を返す。

### `_playEffect(): void`
ジャミング発動時の演出処理。

#### ロジック
1. BGM を一時的にピッチダウン（Phaser の `sound.detune`）。
2. 画面中央にテキスト「わためは悪くないよねぇ」を表示:
   - `this.scene.add.text(400, 300, 'わためは悪くないよねぇ', { fontSize: '32px', fill: '#ff4444', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5)`
3. `jamming_effect` 画像を中央にスプライト表示。
4. `se_jam` SEを再生。
5. Phaser の Tween でフェードアウト（1200ms 後に自動破棄）。

### 演出タイミング仕様
- テキストと画像は `alpha: 1 → 0` のフェードアウト Tween をかける。
- Tween 完了時に `destroy()` で破棄する。
- ゲームの進行を**ブロックしない**（演出は非同期）。

## 完了条件
- `jamRate: 1.0` で必ずジャミングが発動し、座標がずれる。
- `jamRate: 0.0` でジャミングが一切発動しない。
- 演出テキストが表示され、フェードアウト後にオブジェクトが破棄される。

## 依存タスク
- TASK-02
