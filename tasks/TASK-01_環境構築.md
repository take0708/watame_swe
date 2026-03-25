# TASK-01: プロジェクト環境構築

## 概要
Docker + Nginx によるローカル開発環境を構築し、プロジェクトのディレクトリ骨格を作成する。

## 対象ファイル
- `docker-compose.yml`
- `Dockerfile`
- `public/index.html`
- `public/style.css`
- `src/main.js`
- `src/scenes/` (空ディレクトリ)
- `src/entities/` (空ディレクトリ)
- `src/utils/` (空ディレクトリ)
- `public/assets/` (空ディレクトリ)

## 実装内容

### docker-compose.yml
- サービス名: `game`
- イメージ: `nginx:alpine`
- ポートマッピング: `8080:80`
- ボリューム: プロジェクトルート → `/usr/share/nginx/html`

### Dockerfile
- `FROM nginx:alpine`
- `public/` の内容を `/usr/share/nginx/html/` にコピー

### public/index.html
- Phaser 3 を CDN で読み込み（`https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js`）
- `src/main.js` を読み込み
- `style.css` を読み込み
- canvas を中央配置するための `<div id="game-container">` を設置

### public/style.css
- body: `margin: 0; background: #1a1a2e; display: flex; justify-content: center; align-items: center; height: 100vh;`
- `#game-container`: Phaser canvas の配置コンテナ

### src/main.js
- Phaser.Game の設定オブジェクトを定義（type: AUTO, width: 800, height: 600）
- シーンリストに BootScene, MenuScene, GameScene, UIScene を登録（スタブ）
- new Phaser.Game(config) で起動

## 完了条件
- `docker-compose up` でコンテナが起動し、`localhost:8080` でブラウザに空のゲームキャンバスが表示される。

## 依存タスク
なし
