import Board from '../entities/Board.js';
import Jamming from '../entities/Jamming.js';
import CardManager from '../entities/CardManager.js';
import { STAGES, CELL_SIZE } from '../utils/constants.js';

export default class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    init(data) {
        this.playerState   = data.playerState;
        this.currentStage  = STAGES[this.playerState.stage - 1];
        this.isMineMoveMode     = false;
        this.mineMoveCardIndex  = -1;
    }

    create() {
        const { cols, rows, mines, cards, jamRate } = this.currentStage;
        this.jamRate = jamRate;

        this.board   = new Board(cols, rows, mines, cards);
        this.jamming = new Jamming(this);
        this.cardMgr = new CardManager(this);

        // 手札引き継ぎ
        this.playerState.hand.forEach(card => this.cardMgr.hand.push(card));

        // 盤面オフセット（中央寄せ）
        this.offsetX = Math.floor((800 - cols * CELL_SIZE) / 2);
        this.offsetY = Math.floor((560 - rows * CELL_SIZE) / 2);

        this._drawBoard();

        // 入力
        this.input.mouse.disableContextMenu();
        this.input.on('pointerdown', this._onPointerDown, this);

        // ESCキー（マインムーブキャンセル）
        this.input.keyboard.on('keydown-ESC', this._cancelMineMove, this);

        // BGM
        try { this.sound.play('bgm', { loop: true }); } catch (e) {}

        // UIScene 並行起動
        this.scene.launch('UIScene', { cardManager: this.cardMgr, board: this.board });
    }

    update() {}

    // ── 描画 ──────────────────────────────────────────────

    _drawBoard() {
        this.cellSprites = [];
        for (let y = 0; y < this.board.rows; y++) {
            this.cellSprites[y] = [];
            for (let x = 0; x < this.board.cols; x++) {
                const px = this.offsetX + x * CELL_SIZE + CELL_SIZE / 2;
                const py = this.offsetY + y * CELL_SIZE + CELL_SIZE / 2;
                const cell = this.board.grid[y][x];
                const key  = this._textureKey(cell);
                const sprite = this.add.image(px, py, key);
                this.cellSprites[y][x] = sprite;
            }
        }
    }

    _updateCells(cells) {
        for (const cell of cells) {
            const sprite = this.cellSprites[cell.y][cell.x];
            if (sprite) sprite.setTexture(this._textureKey(cell));
        }
    }

    _textureKey(cell) {
        if (cell.isFlagged)   return 'cell_flag';
        if (!cell.isRevealed) return cell.isCard ? 'cell_card' : 'cell_hidden';
        if (cell.isMine)      return 'cell_mine';
        return `cell_${cell.neighborMines}`;
    }

    _refreshAllCells() {
        for (let y = 0; y < this.board.rows; y++)
            for (let x = 0; x < this.board.cols; x++)
                this._updateCells([this.board.grid[y][x]]);
    }

    // ── 入力 ──────────────────────────────────────────────

    _onPointerDown(pointer) {
        if (!this.input.enabled) return;

        const gridX = Math.floor((pointer.x - this.offsetX) / CELL_SIZE);
        const gridY = Math.floor((pointer.y - this.offsetY) / CELL_SIZE);

        if (gridX < 0 || gridX >= this.board.cols || gridY < 0 || gridY >= this.board.rows) return;

        if (this.isMineMoveMode) {
            this._handleMineMovePick(gridX, gridY);
            return;
        }

        if (pointer.rightButtonDown()) {
            this._handleFlag(gridX, gridY);
        } else {
            this._handleOpen(gridX, gridY);
        }
    }

    _handleOpen(x, y) {
        const result = this.jamming.resolve(x, y, this.jamRate, this.board.cols, this.board.rows);
        const rx = result.x, ry = result.y;

        const cell = this.board.grid[ry][rx];
        if (cell.isRevealed || cell.isFlagged) return;

        if (cell.isMine) {
            // リヴァイブ判定
            if (!this.cardMgr.triggerRevive()) {
                this._onGameOver(rx, ry);
                return;
            }
            // リヴァイブ発動 → 地雷セルを表示するが爆発しない
            cell.isRevealed = true;
            this.board.revealedCount++;
            this._updateCells([cell]);
            return;
        }

        const changed = this.board.reveal(rx, ry);
        this._updateCells(changed);

        // カードマス開封
        if (cell.isCard) {
            this.cardMgr.addCard(cell.cardId);
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.refresh) uiScene.refresh();
        }

        if (this.board.isCleared()) this._onStageClear();
    }

    _handleFlag(x, y) {
        this.board.flag(x, y);
        this._updateCells([this.board.grid[y][x]]);
    }

    // ── マインムーブモード ─────────────────────────────────

    enterMineMoveMode(cardIndex) {
        this.isMineMoveMode    = true;
        this.mineMoveCardIndex = cardIndex;
    }

    _handleMineMovePick(x, y) {
        const cell = this.board.grid[y][x];
        if (!cell.isMine) return;

        const result = this.board.moveMine(x, y);
        this.isMineMoveMode = false;

        if (result) {
            const affected = [];
            for (let dy = -4; dy <= 4; dy++)
                for (let dx = -4; dx <= 4; dx++) {
                    const nx = result.from.x + dx, ny = result.from.y + dy;
                    if (nx >= 0 && nx < this.board.cols && ny >= 0 && ny < this.board.rows)
                        affected.push(this.board.grid[ny][nx]);
                    const mx = result.to.x + dx, my = result.to.y + dy;
                    if (mx >= 0 && mx < this.board.cols && my >= 0 && my < this.board.rows)
                        affected.push(this.board.grid[my][mx]);
                }
            this._updateCells(affected);
        }
    }

    _cancelMineMove() {
        if (!this.isMineMoveMode) return;
        this.isMineMoveMode = false;
        // カードを手札に戻す
        this.cardMgr.hand.splice(this.mineMoveCardIndex, 0, { id: 'MINE_MOVE' });
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.refresh) uiScene.refresh();
    }

    // ── 勝敗 / ステージ進行（TASK-11）──────────────────────

    _onGameOver() {
        this.input.enabled = false;

        // 全地雷を表示
        for (let y = 0; y < this.board.rows; y++)
            for (let x = 0; x < this.board.cols; x++) {
                const c = this.board.grid[y][x];
                if (c.isMine) { c.isRevealed = true; this._updateCells([c]); }
            }

        try { this.sound.play('se_mine'); } catch (e) {}
        this.sound.stopByKey('bgm');

        this.add.text(400, 300, 'GAME OVER', {
            fontSize: '64px', fill: '#ff0000', stroke: '#000000', strokeThickness: 8,
        }).setOrigin(0.5).setDepth(200);

        this.time.delayedCall(2000, () => {
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
    }

    _onStageClear() {
        this.input.enabled = false;

        this.tweens.add({
            targets: this.sound.get('bgm'),
            volume: 0,
            duration: 1000,
        });

        this.add.text(400, 280, 'STAGE CLEAR!', {
            fontSize: '56px', fill: '#ffdd00', stroke: '#000000', strokeThickness: 8,
        }).setOrigin(0.5).setDepth(200);

        this.playerState.stage++;

        if (this.playerState.stage > STAGES.length) {
            // 全ステージクリア
            this.add.text(400, 360, 'ALL CLEAR! WATAME IS INNOCENT!', {
                fontSize: '24px', fill: '#ffffff', stroke: '#000000', strokeThickness: 4,
            }).setOrigin(0.5).setDepth(200);

            this.time.delayedCall(3000, () => {
                this.sound.stopByKey('bgm');
                this.scene.stop('UIScene');
                this.scene.start('MenuScene');
            });
        } else {
            // 次ステージへ
            this.playerState.hand = this.cardMgr.hand;

            this.time.delayedCall(2000, () => {
                this.sound.stopByKey('bgm');
                this.scene.stop('UIScene');
                this.scene.restart({ playerState: this.playerState });
            });
        }
    }
}
