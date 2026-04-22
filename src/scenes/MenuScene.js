import { CARDS, CARD_THEMES, TYPE_META } from '../utils/constants.js';

function _randomBg() {
    return Math.random() < 0.5 ? 'bg1' : 'bg2';
}

export default class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        this.add.image(400, 300, _randomBg()).setDisplaySize(800, 600);

        this.add.text(400, 180, 'わためは悪くないよねぇ', {
            fontSize: '28px', fill: '#ffffff',
        }).setOrigin(0.5);

        this.add.text(400, 225, 'デッキ構築型マインスイーパ', {
            fontSize: '16px', fill: '#aaaaaa',
        }).setOrigin(0.5);

        const startBtn = this.add.text(400, 330, 'START', {
            fontSize: '36px', fill: '#ffdd00',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        startBtn.on('pointerover',  () => startBtn.setStyle({ fill: '#ffffff' }));
        startBtn.on('pointerout',   () => startBtn.setStyle({ fill: '#ffdd00' }));
        startBtn.on('pointerdown',  () => this._startGame());

        const helpBtn = this.add.text(400, 395, '? HELP', {
            fontSize: '20px', fill: '#88aacc',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        helpBtn.on('pointerover',  () => helpBtn.setStyle({ fill: '#ffffff' }));
        helpBtn.on('pointerout',   () => helpBtn.setStyle({ fill: '#88aacc' }));
        helpBtn.on('pointerdown',  () => this._showHelp());
    }

    _startGame() {
        this.scene.start('GameScene', {
            playerState: { stage: 1, hp: 1, hand: [] },
        });
    }

    _showHelp() {
        const overlay = this.add.container(0, 0).setDepth(100);

        // 背景
        const bg = this.add.graphics();
        bg.fillStyle(0x04040e, 0.96).fillRect(0, 0, 800, 600);
        bg.lineStyle(1, 0x334466).strokeRect(10, 10, 780, 580);
        overlay.add(bg);

        // タイトル
        overlay.add(
            this.add.text(400, 30, 'カード説明', {
                fontSize: '26px', color: '#ddeeff', fontStyle: 'bold',
            }).setOrigin(0.5, 0)
        );

        // タイトル下ライン
        const line = this.add.graphics();
        line.lineStyle(1, 0x446688).lineBetween(60, 72, 740, 72);
        overlay.add(line);

        // カードパネル 2×2
        const positions = [
            { x: 205, y: 195 },
            { x: 595, y: 195 },
            { x: 205, y: 390 },
            { x: 595, y: 390 },
        ];

        Object.values(CARDS).forEach((def, i) => {
            const { x, y } = positions[i];
            const theme = CARD_THEMES[def.id];
            const typeMeta = TYPE_META[def.type] ?? { label: '', color: '#ffffff' };
            const PW = 340, PH = 160;

            // パネル背景
            const panel = this.add.graphics();
            panel.fillStyle(theme.bg).fillRoundedRect(x - PW / 2, y - PH / 2, PW, PH, 10);
            panel.fillStyle(theme.mid, 0.5).fillRoundedRect(x - PW / 2, y - PH / 2, PW, PH / 2, 10);
            panel.lineStyle(1.5, theme.border).strokeRoundedRect(x - PW / 2, y - PH / 2, PW, PH, 10);
            panel.lineStyle(2, theme.accent).lineBetween(x - PW / 2 + 10, y - PH / 2 + 1, x + PW / 2 - 10, y - PH / 2 + 1);
            overlay.add(panel);

            // アイコン
            overlay.add(
                this.add.text(x - PW / 2 + 30, y, theme.icon, {
                    fontSize: '30px', color: theme.iconColor, fontStyle: 'bold',
                }).setOrigin(0.5)
            );

            // カード名 + タイプバッジ
            overlay.add(
                this.add.text(x - PW / 2 + 70, y - 42, def.name, {
                    fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
                }).setOrigin(0, 0.5)
            );
            overlay.add(
                this.add.text(x - PW / 2 + 70, y - 20, typeMeta.label, {
                    fontSize: '11px', color: typeMeta.color,
                }).setOrigin(0, 0.5)
            );

            // 説明文
            overlay.add(
                this.add.text(x - PW / 2 + 16, y + 6, def.desc, {
                    fontSize: '12px', color: '#b8cce0',
                    wordWrap: { width: PW - 24 },
                })
            );
        });

        // 閉じるボタン
        const closeBtn = this.add.text(400, 548, '× 閉じる', {
            fontSize: '20px', color: '#778899',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover',  () => closeBtn.setStyle({ color: '#ffffff' }));
        closeBtn.on('pointerout',   () => closeBtn.setStyle({ color: '#778899' }));
        closeBtn.on('pointerdown',  () => overlay.destroy());
        overlay.add(closeBtn);
    }
}
