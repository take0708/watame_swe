import { CARDS, MAX_HAND_SIZE } from '../utils/constants.js';

// カード種ごとのデザインテーマ
const CARD_THEMES = {
    MINE_SEARCH_1: { bg: 0x0d2654, mid: 0x1a3a80, accent: 0x4488ff, border: 0x6699dd, icon: '○', iconColor: '#88bbff', badge: '×1' },
    MINE_SEARCH_3: { bg: 0x0d3a3a, mid: 0x1a5555, accent: 0x44cccc, border: 0x66bbcc, icon: '○', iconColor: '#88eeff', badge: '×3' },
    REVIVE:        { bg: 0x0d3a0d, mid: 0x1a5520, accent: 0x44ff66, border: 0x66cc88, icon: '♥', iconColor: '#aaffaa', badge: ''   },
    MINE_MOVE:     { bg: 0x2a1a40, mid: 0x3d2860, accent: 0xaa66ff, border: 0x9966dd, icon: '⇄', iconColor: '#ddaaff', badge: ''   },
};

const CARD_W  = 120;
const CARD_H  = 88;
const SLOT_GAP = 150;

export default class UIScene extends Phaser.Scene {
    constructor() { super('UIScene'); }

    create(data) {
        this.cardMgr = data.cardManager;
        this.board   = data.board;

        // 背景バー（手札エリア）
        const barG = this.add.graphics();
        barG.fillStyle(0x111122, 0.85).fillRect(0, 505, 800, 95);
        barG.lineStyle(1, 0x334466).strokeRect(0, 505, 800, 95);

        // ステージ情報
        const gameScene = this.scene.get('GameScene');
        const stageNum  = gameScene ? gameScene.playerState.stage : 1;
        this.stageText  = this.add.text(790, 510, `STAGE: ${stageNum}`, {
            fontSize: '13px', color: '#aabbcc',
        }).setOrigin(1, 0);

        // ラベル
        this.add.text(10, 510, 'HAND', {
            fontSize: '12px', color: '#556677', fontStyle: 'bold',
        });

        this.slots = [];
        this.refresh();
    }

    refresh() {
        this.slots.forEach(s => s.destroy());
        this.slots = [];

        const totalW  = (MAX_HAND_SIZE - 1) * SLOT_GAP;
        const startX  = 400 - totalW / 2;

        for (let i = 0; i < MAX_HAND_SIZE; i++) {
            const x    = startX + i * SLOT_GAP;
            const y    = 552;
            const card = this.cardMgr.hand[i];

            const container = card
                ? this._buildCard(x, y, card, i)
                : this._buildEmptySlot(x, y, i);

            this.slots.push(container);
        }
    }

    // ── カード描画 ─────────────────────────────────────────

    _buildCard(x, y, card, index) {
        const theme = CARD_THEMES[card.id] ?? {
            bg: 0x222233, mid: 0x333344, accent: 0x888899, border: 0x666677,
            icon: '?', iconColor: '#ffffff', badge: '',
        };
        const container = this.add.container(x, y);
        const hw = CARD_W / 2, hh = CARD_H / 2;

        // ドロップシャドウ
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.5)
            .fillRoundedRect(-hw + 3, -hh + 4, CARD_W, CARD_H, 8);
        container.add(shadow);

        // カード本体背景
        const body = this.add.graphics();
        body.fillStyle(theme.bg)
            .fillRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);
        // 上部グラデーション風ハイライト
        body.fillStyle(theme.mid, 0.8)
            .fillRoundedRect(-hw, -hh, CARD_W, CARD_H / 2, 8);
        body.fillStyle(theme.mid, 0)
            .fillRoundedRect(-hw, -hh, CARD_W, CARD_H / 2, 0);
        // ボーダー
        body.lineStyle(1.5, theme.border, 0.9)
            .strokeRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);
        // アクセントライン（上端）
        body.lineStyle(2, theme.accent, 1)
            .lineBetween(-hw + 8, -hh + 1, hw - 8, -hh + 1);
        container.add(body);

        // アイコン（中央上）
        const iconText = this.add.text(0, -14, theme.icon, {
            fontSize: '22px', color: theme.iconColor, fontStyle: 'bold',
        }).setOrigin(0.5);
        container.add(iconText);

        // バッジ（×n）
        if (theme.badge) {
            const badge = this.add.text(hw - 6, -hh + 6, theme.badge, {
                fontSize: '10px', color: theme.iconColor, fontStyle: 'bold',
            }).setOrigin(1, 0);
            container.add(badge);
        }

        // カード名（下部）
        const nameText = this.add.text(0, 22, CARDS[card.id]?.name ?? card.id, {
            fontSize: '11px', color: '#e0e8ff', fontStyle: 'bold',
            wordWrap: { width: CARD_W - 10 },
        }).setOrigin(0.5, 0);
        container.add(nameText);

        // インタラクション（ヒットエリア）
        const hit = this.add.rectangle(0, 0, CARD_W, CARD_H)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover',  () => {
            this.tweens.add({ targets: container, scaleX: 1.07, scaleY: 1.07, duration: 80, ease: 'Cubic.Out' });
            body.lineStyle(2, theme.accent, 1).strokeRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);
        });
        hit.on('pointerout',   () => {
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80, ease: 'Cubic.Out' });
        });
        hit.on('pointerdown',  () => this._onCardClick(index));
        hit.on('rightdown',    () => this._onCardDiscard(index));

        container.add(hit);
        return container;
    }

    _buildEmptySlot(x, y, index) {
        const container = this.add.container(x, y);
        const hw = CARD_W / 2, hh = CARD_H / 2;

        const g = this.add.graphics();
        g.lineStyle(1, 0x334455, 0.6)
            .strokeRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);
        g.fillStyle(0x0d1020, 0.4)
            .fillRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);

        const t = this.add.text(0, 0, '―', {
            fontSize: '18px', color: '#334455',
        }).setOrigin(0.5);

        container.add([g, t]);
        return container;
    }

    // ── カード操作 ────────────────────────────────────────

    _onCardClick(index) {
        const card = this.cardMgr.hand[index];
        if (!card) return;

        const gameScene = this.scene.get('GameScene');

        if (card.id === 'MINE_MOVE') {
            this.cardMgr.removeCard(index);
            gameScene.enterMineMoveMode(index);
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
        const modal    = this.add.container(400, 300).setDepth(300);

        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1a, 0.92).fillRoundedRect(-220, -80, 440, 160, 12);
        bg.lineStyle(1.5, 0x334466).strokeRoundedRect(-220, -80, 440, 160, 12);

        const msg = this.add.text(0, -42, `「${cardName}」を破棄しますか？`, {
            fontSize: '15px', color: '#ddeeff',
        }).setOrigin(0.5);

        const yesBtn = this._makeModalBtn(-80, 28, 'YES', '#ff5555', 0x3a1010);
        const noBtn  = this._makeModalBtn( 80, 28, 'NO',  '#55ff88', 0x103a18);

        modal.add([bg, msg, yesBtn, noBtn]);

        const close = () => {
            modal.destroy();
            if (gameScene) gameScene.input.enabled = true;
        };

        yesBtn.getAt(0).on('pointerdown', () => {
            this.cardMgr.removeCard(index);
            this.refresh();
            close();
        });
        noBtn.getAt(0).on('pointerdown', close);
    }

    _makeModalBtn(x, y, label, textColor, bgColor) {
        const btn = this.add.container(x, y);
        const g   = this.add.graphics();
        g.fillStyle(bgColor).fillRoundedRect(-50, -18, 100, 36, 6);
        g.lineStyle(1.5, Phaser.Display.Color.ValueToColor(textColor).color)
            .strokeRoundedRect(-50, -18, 100, 36, 6);
        g.setInteractive(new Phaser.Geom.Rectangle(-50, -18, 100, 36), Phaser.Geom.Rectangle.Contains);
        const t = this.add.text(0, 0, label, {
            fontSize: '16px', color: textColor, fontStyle: 'bold',
        }).setOrigin(0.5);
        g.on('pointerover',  () => g.setAlpha(0.75));
        g.on('pointerout',   () => g.setAlpha(1));
        btn.add([g, t]);
        return btn;
    }
}
