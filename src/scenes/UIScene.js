import { CARDS, MAX_HAND_SIZE } from '../utils/constants.js';

export default class UIScene extends Phaser.Scene {
    constructor() { super('UIScene'); }

    create(data) {
        this.cardMgr = data.cardManager;
        this.board   = data.board;

        // ステージ情報テキスト
        const gameScene = this.scene.get('GameScene');
        const stageNum = gameScene ? gameScene.playerState.stage : 1;
        this.stageText = this.add.text(760, 10, `STAGE: ${stageNum}`, {
            fontSize: '14px', fill: '#ffffff',
        }).setOrigin(1, 0);

        // カードスロット
        this.slots = [];
        this.refresh();
    }

    refresh() {
        // 既存スロットを破棄
        this.slots.forEach(s => s.destroy());
        this.slots = [];

        const totalW = (MAX_HAND_SIZE - 1) * 160;
        const startX = 400 - totalW / 2;

        for (let i = 0; i < MAX_HAND_SIZE; i++) {
            const x = startX + i * 160;
            const y = 555;
            const container = this.add.container(x, y);

            const frame = this.add.image(0, 0, 'card_ui_frame');
            container.add(frame);

            const card = this.cardMgr.hand[i];
            if (card) {
                const label = this.add.text(0, 0, CARDS[card.id]?.name ?? card.id, {
                    fontSize: '12px', fill: '#ffffff',
                }).setOrigin(0.5);
                container.add(label);

                frame.setInteractive({ useHandCursor: true });
                frame.on('pointerover',  () => frame.setAlpha(0.7));
                frame.on('pointerout',   () => frame.setAlpha(1.0));
                frame.on('pointerdown',  (ptr) => {
                    if (ptr.rightButtonDown()) {
                        this._onCardDiscard(i);
                    } else {
                        this._onCardClick(i);
                    }
                });

                // 右クリック個別対応
                frame.on('rightdown', () => this._onCardDiscard(i));
            } else {
                const label = this.add.text(0, 0, '---', {
                    fontSize: '12px', fill: '#666666',
                }).setOrigin(0.5);
                container.add(label);
            }

            this.slots.push(container);
        }
    }

    _onCardClick(index) {
        const card = this.cardMgr.hand[index];
        if (!card) return;

        const gameScene = this.scene.get('GameScene');

        if (card.id === 'MINE_MOVE') {
            gameScene.enterMineMoveMode(index);
            // カードを手札から仮に取り出す（キャンセル時に戻す）
            this.cardMgr.removeCard(index);
            this.refresh();
        } else {
            const changed = this.cardMgr.useCard(index, this.board, this);
            if (changed && changed.length > 0 && gameScene) {
                gameScene._updateCells(changed);
            }
            this.refresh();
        }
    }

    _onCardDiscard(index) {
        const card = this.cardMgr.hand[index];
        if (!card) return;

        const gameScene = this.scene.get('GameScene');
        if (gameScene) gameScene.input.enabled = false;

        const cardName = CARDS[card.id]?.name ?? card.id;
        const modal = this.add.container(400, 300).setDepth(300);

        const bg = this.add.rectangle(0, 0, 400, 180, 0x000000, 0.85);
        const msg = this.add.text(0, -50, `「${cardName}」を破棄しますか？`, {
            fontSize: '16px', fill: '#ffffff',
        }).setOrigin(0.5);

        const yesBtn = this.add.text(-80, 30, 'YES', {
            fontSize: '24px', fill: '#ff4444',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const noBtn = this.add.text(80, 30, 'NO', {
            fontSize: '24px', fill: '#44ff44',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        modal.add([bg, msg, yesBtn, noBtn]);

        const close = () => {
            modal.destroy();
            if (gameScene) gameScene.input.enabled = true;
        };

        yesBtn.on('pointerdown', () => {
            this.cardMgr.removeCard(index);
            this.refresh();
            close();
        });
        noBtn.on('pointerdown', () => close());
    }
}
