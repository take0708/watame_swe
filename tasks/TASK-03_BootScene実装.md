# TASK-03: BootScene 実装

## 概要
ゲーム起動時に全アセットを Phaser のキャッシュへロードし、完了後 MenuScene へ遷移する。

## 対象ファイル
- `src/scenes/BootScene.js`

## 実装内容

### クラス定義
```js
export default class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() { ... }
    create()  { ... }
}
```

### preload() で読み込むアセット一覧

| キー | 種別 | パス | 備考 |
| :--- | :--- | :--- | :--- |
| `cell_hidden` | image | `assets/images/cell_hidden.png` | 未開封セル |
| `cell_0`〜`cell_8` | image | `assets/images/cell_0.png` 〜 | 数字セル（0は空白） |
| `cell_mine` | image | `assets/images/cell_mine.png` | 地雷セル（爆発後） |
| `cell_flag` | image | `assets/images/cell_flag.png` | 旗セル |
| `cell_card` | image | `assets/images/cell_card.png` | カードマス（開封前） |
| `bg` | image | `assets/images/bg.png` | 背景 |
| `card_ui_frame` | image | `assets/images/card_ui_frame.png` | カード枠 |
| `jamming_effect` | image | `assets/images/jamming_effect.png` | ジャミング演出 |
| `bgm` | audio | `assets/audio/bgm.ogg` | BGM |
| `se_open` | audio | `assets/audio/se_open.ogg` | セル開封音 |
| `se_mine` | audio | `assets/audio/se_mine.ogg` | 地雷爆発音 |
| `se_jam` | audio | `assets/audio/se_jam.ogg` | ジャミング発動音 |
| `se_card` | audio | `assets/audio/se_card.ogg` | カード使用音 |

### create()
- `this.scene.start('MenuScene')` で遷移。

---

### プレースホルダーアセットの作成

実際のグラフィック・音声素材が揃っていない段階でも動作確認できるよう、以下のプレースホルダーを用意する。

#### 画像（32×32 px の単色 PNG）
各キーに対応するパスへ配置する。内容は単色の塗りつぶしで構わない。
- `cell_hidden.png` — グレー (#888)
- `cell_0.png` — 薄グレー (#ccc)
- `cell_1.png`〜`cell_8.png` — 薄グレー (#ccc)（数字はテキストで後から重ねる）
- `cell_mine.png` — 赤 (#f00)
- `cell_flag.png` — 黄 (#ff0)
- `cell_card.png` — 水色 (#4af)
- `bg.png` — 紺 (#1a1a2e)（800×600 px）
- `card_ui_frame.png` — 暗グレー (#444)（140×64 px）
- `jamming_effect.png` — 白 (#fff)（200×80 px）

#### 音声
Phaser は音声ファイルが存在しないとエラーになるため、空の ogg ファイル（無音1秒）をプレースホルダーとして用意する:
`bgm.ogg`, `se_open.ogg`, `se_mine.ogg`, `se_jam.ogg`, `se_card.ogg`

生成コマンド例（ffmpeg がある場合）:
```sh
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libvorbis placeholder.ogg
```
ffmpeg がない場合は任意のツールで無音 ogg を1ファイル作成し、必要なファイル名でコピーする。

---

### main.js への BootScene 登録

`src/scenes/BootScene.js` 作成後、`src/main.js` を以下のように更新する:
```js
import BootScene from './scenes/BootScene.js';
// （他シーンは後続タスクで順次追加）
const config = {
    ...
    scene: [BootScene, /* MenuScene, GameScene, UIScene */],
};
```

## 完了条件
- ブラウザコンソールにアセット読み込みエラーが出ず、MenuScene へ遷移する（アセットはプレースホルダーでも可）。
- `public/assets/images/` に全画像プレースホルダーが配置されている。
- `public/assets/audio/` に全音声プレースホルダーが配置されている。
- `src/main.js` に `BootScene` が import・登録されている。

## 依存タスク
- TASK-01
