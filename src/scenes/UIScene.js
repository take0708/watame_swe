import { CARDS, CARD_THEMES, TYPE_META, MAX_HAND_SIZE } from '../utils/constants.js';

const CARD_W   = 120;
const CARD_H   = 88;
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

        this.add.text(10, 510, 'HAND', {
            fontSize: '12px', color: '#556677', fontStyle: 'bold',
        });

        // 操作ヒント
        this.add.text(400, 592, '左クリック: 使用　右クリック: 説明 / 破棄', {
            fontSize: '10px', color: '#445566',
        }).setOrigin(0.5, 1);

        this.slots = [];
        this.refresh();
    }

    refresh() {
        this.slots.forEach(s => s.destroy());
        this.slots = [];

        const totalW = (MAX_HAND_SIZE - 1) * SLOT_GAP;
        const startX = 400 - totalW / 2;

        for (let i = 0; i < MAX_HAND_SIZE; i++) {
            const x    = startX + i * SLOT_GAP;
            const y    = 552;
            const card = this.cardMgr.hand[i];
            const container = card
                ? this._buildCard(x, y, card, i)
                : this._buildEmptySlot(x, y);
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
        shadow.fillStyle(0x000000, 0.5).fillRoundedRect(-hw + 3, -hh + 4, CARD_W, CARD_H, 8);
        container.add(shadow);

        // カード本体
        const body = this.add.graphics();
        body.fillStyle(theme.bg).fillRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);
        body.fillStyle(theme.mid, 0.8).fillRoundedRect(-hw, -hh, CARD_W, CARD_H / 2, 8);
        body.lineStyle(1.5, theme.border, 0.9).strokeRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);
        body.lineStyle(2, theme.accent, 1).lineBetween(-hw + 8, -hh + 1, hw - 8, -hh + 1);
        container.add(body);

        // アイコン
        container.add(
            this.add.text(0, -14, theme.icon, {
                fontSize: '22px', color: theme.iconColor, fontStyle: 'bold',
            }).setOrigin(0.5)
        );

        // バッジ
        if (theme.badge) {
            container.add(
                this.add.text(hw - 6, -hh + 6, theme.badge, {
                    fontSize: '10px', color: theme.iconColor, fontStyle: 'bold',
                }).setOrigin(1, 0)
            );
        }

        // カード名
        container.add(
            this.add.text(0, 22, CARDS[card.id]?.name ?? card.id, {
                fontSize: '11px', color: '#e0e8ff', fontStyle: 'bold',
                wordWrap: { width: CARD_W - 10 },
            }).setOrigin(0.5, 0)
        );

        // ヒットエリア
        const hit = this.add.rectangle(0, 0, CARD_W, CARD_H).setInteractive({ useHandCursor: true });
        hit.on('pointerover',  () => {
            this.tweens.add({ targets: container, scaleX: 1.07, scaleY: 1.07, duration: 80, ease: 'Cubic.Out' });
            body.lineStyle(2, theme.accent, 1).strokeRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);
        });
        hit.on('pointerout',   () => {
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80, ease: 'Cubic.Out' });
        });
        hit.on('pointerdown',  () => this._onCardClick(index));
        hit.on('rightdown',    () => this._showCardDesc(index));  // 右クリック → 説明モーダル
        container.add(hit);
        return container;
    }

    _buildEmptySlot(x, y) {
        const container = this.add.container(x, y);
        const hw = CARD_W / 2, hh = CARD_H / 2;
        const g = this.add.graphics();
        g.lineStyle(1, 0x334455, 0.6).strokeRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);
        g.fillStyle(0x0d1020, 0.4).fillRoundedRect(-hw, -hh, CARD_W, CARD_H, 8);
        container.add([g, this.add.text(0, 0, '―', { fontSize: '18px', color: '#334455' }).setOrigin(0.5)]);
        return container;
    }

    // ── カード操作 ────────────────────────────────────────

    _onCardClick(index) {
        const card = this.cardMgr.hand[index];
        if (!card) return;
        const gameScene = this.scene.get('GameScene');

        // if (card.id === 'MINE_MOVE') { // 一時無効化
        //     this.cardMgr.removeCard(index);
        //     gameScene.enterMineMoveMode(index);
        //     this.refresh();
        // } else {
            const changed = this.cardMgr.useCard(index, this.board, this);
            if (changed && changed.length > 0 && gameScene) gameScene._updateCells(changed);
            this.refresh();
        // }
    }

    // 説明モーダル（右クリック）
    _showCardDesc(index) {
        const card = this.cardMgr.hand[index];
        if (!card) return;

        const def       = CARDS[card.id];
        const theme     = CARD_THEMES[card.id] ?? { bg: 0x111122, accent: 0x4488ff, border: 0x446688, icon: '?', iconColor: '#ffffff' };
        const typeMeta  = TYPE_META[def?.type] ?? { label: '', color: '#ffffff' };
        const gameScene = this.scene.get('GameScene');
        if (gameScene) gameScene.input.enabled = false;

        const modal = this.add.container(400, 285).setDepth(300);

        // 背景
        const bg = this.add.graphics();
        bg.fillStyle(0x06060f, 0.96).fillRoundedRect(-185, -130, 370, 262, 12);
        bg.lineStyle(1.5, theme.border ?? 0x446688).strokeRoundedRect(-185, -130, 370, 262, 12);
        bg.lineStyle(2, theme.accent).lineBetween(-165, -110, 165, -110);
        modal.add(bg);

        // アイコン
        modal.add(this.add.text(0, -95, theme.icon, {
            fontSize: '30px', color: theme.iconColor, fontStyle: 'bold',
        }).setOrigin(0.5));

        // カード名
        modal.add(this.add.text(0, -62, def?.name ?? card.id, {
            fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5));

        // タイプバッジ
        modal.add(this.add.text(0, -38, typeMeta.label, {
            fontSize: '12px', color: typeMeta.color,
        }).setOrigin(0.5));

        // 区切り線
        const sep = this.add.graphics();
        sep.lineStyle(1, 0x334466).lineBetween(-160, -20, 160, -20);
        modal.add(sep);

        // 説明文
        modal.add(this.add.text(0, -10, def?.desc ?? '説明なし', {
            fontSize: '13px', color: '#c0d8f0',
            wordWrap: { width: 340 },
            align: 'center',
        }).setOrigin(0.5, 0));

        // ボタン
        const discardBtn = this._makeModalBtn(-75, 100, '破棄する', '#ff5555', 0x3a1010);
        const closeBtn   = this._makeModalBtn( 75, 100, '閉じる',   '#aabbcc', 0x1a2030);
        modal.add([discardBtn, closeBtn]);

        const close = () => {
            modal.destroy();
            if (gameScene) gameScene.input.enabled = true;
        };

        discardBtn.getAt(0).on('pointerdown', () => {
            this.cardMgr.removeCard(index);
            this.refresh();
            close();
        });
        closeBtn.getAt(0).on('pointerdown', close);
    }

    // ── 共通ボタン ────────────────────────────────────────

    _makeModalBtn(x, y, label, textColor, bgColor) {
        const btn = this.add.container(x, y);
        const g   = this.add.graphics();
        g.fillStyle(bgColor).fillRoundedRect(-55, -18, 110, 36, 6);
        g.lineStyle(1.5, Phaser.Display.Color.ValueToColor(textColor).color)
            .strokeRoundedRect(-55, -18, 110, 36, 6);
        g.setInteractive(new Phaser.Geom.Rectangle(-55, -18, 110, 36), Phaser.Geom.Rectangle.Contains);
        const t = this.add.text(0, 0, label, {
            fontSize: '15px', color: textColor, fontStyle: 'bold',
        }).setOrigin(0.5);
        g.on('pointerover',  () => g.setAlpha(0.75));
        g.on('pointerout',   () => g.setAlpha(1));
        btn.add([g, t]);
        return btn;
    }
}
