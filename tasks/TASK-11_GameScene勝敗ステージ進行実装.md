# TASK-11: GameScene 勝敗判定・ステージ進行実装

## 概要
ゲームオーバー処理、ステージクリア処理、次ステージへの遷移を `GameScene` に実装する。

## 対象ファイル
- `src/scenes/GameScene.js`（TASK-10 の続き）

## 実装内容

---

### `_onGameOver()`
地雷を踏んでリヴァイブがなかった場合に呼び出される。

#### ロジック
1. 入力を無効化: `this.input.enabled = false`
2. 全地雷セルを `cell_mine` テクスチャで表示（盤面を全開示）。
3. `se_mine` SEを再生。
4. BGM を停止: `this.sound.stopByKey('bgm')`
5. 画面中央に「GAME OVER」テキストを表示（赤、大きめ）。
6. 2000ms 後に MenuScene へ遷移:
   ```js
   this.time.delayedCall(2000, () => {
       this.scene.start('MenuScene');
   });
   ```

---

### `_onStageClear()`
`board.isCleared()` が true になったとき呼び出される。

#### ロジック
1. 入力を無効化: `this.input.enabled = false`
2. BGM をフェードアウト（Tween: volume 1.0 → 0, 1000ms）。
3. 「STAGE CLEAR!」テキストを画面中央に表示（黄色）。
4. `playerState.stage` をインクリメント。
5. **最終ステージ（stage 5）クリアの場合**:
   - 「ALL CLEAR! WATAME IS INNOCENT!」テキストを追加表示。
   - 3000ms 後に MenuScene へ遷移。
6. **通常ステージクリアの場合**:
   - 手札をそのまま引き継ぐ（`playerState.hand = this.cardMgr.hand`）。
   - 2000ms 後に次ステージで GameScene を再起動:
     ```js
     this.time.delayedCall(2000, () => {
         this.sound.stopByKey('bgm'); // restart 前に必ず BGM を停止（二重再生防止）
         this.scene.restart({ playerState: this.playerState });
     });
     ```

---

## 完了条件
- 地雷を踏むと（リヴァイブなし）GAME OVER が表示され、MenuScene に戻る。
- 全非地雷マスを開封すると STAGE CLEAR が表示され、次ステージへ進む。
- 手札がステージをまたいで引き継がれる。
- ステージ5クリアで ALL CLEAR が表示され、MenuScene へ戻る。

## 依存タスク
- TASK-09
- TASK-10
