import { MAX_HAND_SIZE, CARDS } from '../utils/constants.js';
import { shuffleArray } from '../utils/helpers.js';

export default class CardManager {
    constructor(scene) {
        this.scene = scene;
        this.hand = [];
    }

    // TASK-08: 手札管理

    addCard(cardId) {
        if (this.hand.length < MAX_HAND_SIZE) {
            this.hand.push({ id: cardId });
            return;
        }
        // 満杯 → 交換UI表示
        this._showSwapUI(cardId);
    }

    removeCard(index) {
        if (index < 0 || index >= this.hand.length) return null;
        return this.hand.splice(index, 1)[0];
    }

    hasRevive() {
        return this.hand.some(c => c.id === 'REVIVE');
    }

    consumeRevive() {
        const idx = this.hand.findIndex(c => c.id === 'REVIVE');
        if (idx !== -1) this.hand.splice(idx, 1);
    }

    _showSwapUI(newCardId) {
        const scene = this.scene;
        scene.input.enabled = false;

        const container = scene.add.container(0, 0).setDepth(200);

        // 背景
        const bg = scene.add.rectangle(400, 300, 600, 220, 0x000000, 0.8);
        container.add(bg);

        const title = scene.add.text(400, 200, `新カード「${CARDS[newCardId]?.name ?? newCardId}」を入手。どれかと交換しますか？`, {
            fontSize: '14px', fill: '#ffffff',
        }).setOrigin(0.5);
        container.add(title);

        const slotW = 120, startX = 400 - slotW * 1.5;

        const closeUI = (selectedIdx) => {
            if (selectedIdx !== null && selectedIdx !== undefined) {
                this.hand.splice(selectedIdx, 1, { id: newCardId });
            }
            container.destroy();
            scene.input.enabled = true;
            const uiScene = scene.scene.get('UIScene');
            if (uiScene && uiScene.refresh) uiScene.refresh();
        };

        this.hand.forEach((card, i) => {
            const x = startX + i * slotW + slotW / 2;
            const frame = scene.add.image(x, 270, 'card_ui_frame').setInteractive({ useHandCursor: true });
            const label = scene.add.text(x, 270, CARDS[card.id]?.name ?? card.id, {
                fontSize: '12px', fill: '#ffffff',
            }).setOrigin(0.5);
            frame.on('pointerover',  () => frame.setAlpha(0.7));
            frame.on('pointerout',   () => frame.setAlpha(1.0));
            frame.on('pointerdown',  () => closeUI(i));
            container.add([frame, label]);
        });

        // 捨てるボタン
        const discardBtn = scene.add.text(400, 350, '捨てる', {
            fontSize: '16px', fill: '#ff8888',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        discardBtn.on('pointerdown', () => closeUI(null));
        container.add(discardBtn);
    }

    // TASK-09: カード効果

    useCard(index, board, uiScene) {
        const card = this.removeCard(index);
        if (!card) return [];

        let changedCells = [];
        switch (card.id) {
            case 'MINE_SEARCH_1':
                changedCells = this._useMineSearch(board, 1);
                break;
            case 'MINE_SEARCH_3':
                changedCells = this._useMineSearch(board, 3);
                break;
            case 'MINE_MOVE':
                // MineMove は GameScene 経由で処理するため、ここでは何もしない
                break;
        }

        if (uiScene && uiScene.refresh) uiScene.refresh();
        try { this.scene.sound.play('se_card'); } catch (e) {}

        return changedCells;
    }

    _useMineSearch(board, count) {
        const candidates = [];
        for (let y = 0; y < board.rows; y++)
            for (let x = 0; x < board.cols; x++) {
                const c = board.grid[y][x];
                if (c.isMine && !c.isRevealed && !c.isFlagged) candidates.push(c);
            }
        shuffleArray(candidates);
        const targets = candidates.slice(0, count);
        for (const cell of targets) {
            board.flag(cell.x, cell.y);
        }
        return targets;
    }

    triggerRevive() {
        if (!this.hasRevive()) return false;
        this.consumeRevive();

        const scene = this.scene;
        const text = scene.add.text(400, 260, 'リヴァイブ発動！', {
            fontSize: '36px', fill: '#00ffcc', stroke: '#000000', strokeThickness: 6,
        }).setOrigin(0.5).setDepth(150);
        scene.tweens.add({
            targets: text,
            alpha: 0,
            duration: 1500,
            onComplete: () => text.destroy(),
        });

        const uiScene = scene.scene.get('UIScene');
        if (uiScene && uiScene.refresh) uiScene.refresh();

        return true;
    }
}
