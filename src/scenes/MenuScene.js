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

        const startBtn = this.add.text(400, 330, 'ゲームを始める', {
            fontSize: '36px', fill: '#ffdd00',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        startBtn.on('pointerover',  () => startBtn.setStyle({ fill: '#ffffff' }));
        startBtn.on('pointerout',   () => startBtn.setStyle({ fill: '#ffdd00' }));
        startBtn.on('pointerdown',  () => this._startGame());

        const helpBtn = this.add.text(400, 395, 'ゲーム説明', {
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

    // ── ヘルプオーバーレイ ────────────────────────────────

    _showHelp() {
        const overlay = this.add.container(0, 0).setDepth(100);

        // 背景
        const bg = this.add.graphics();
        bg.fillStyle(0x04040e, 0.96).fillRect(0, 0, 800, 600);
        bg.lineStyle(1, 0x334466).strokeRect(10, 10, 780, 580);
        overlay.add(bg);

        // タブ定義
        const TABS = ['遊び方', 'カード一覧'];
        let activeTab = 0;

        // ページコンテナ
        let pageContainer = this.add.container(0, 0);
        overlay.add(pageContainer);

        const tabLine = this.add.graphics();
        overlay.add(tabLine);

        // ── ページ描画ロジック（先に定義）──────────────

        const _buildPage = (tab, container) => {
            if (tab === 0) this._buildRulesPage(container);
            else           this._buildCardsPage(container);
        };

        const _refreshTabs = () => {
            tabBtns.forEach((btn, idx) => {
                btn.setStyle({ color: idx === activeTab ? '#ffffff' : '#556677' });
            });
            tabLine.clear();
            tabLine.lineStyle(2, 0x4488ff).lineBetween(
                210 + activeTab * 200 - 40, 56,
                210 + activeTab * 200 + 40, 56
            );
        };

        // タブボタン生成
        const tabBtns = TABS.map((label, idx) => {
            const btn = this.add.text(210 + idx * 200, 38, label, {
                fontSize: '17px', fontStyle: 'bold',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                if (activeTab === idx) return;
                activeTab = idx;
                _refreshTabs();
                pageContainer.destroy();
                pageContainer = this.add.container(0, 0);
                overlay.add(pageContainer);
                _buildPage(activeTab, pageContainer);
            });
            overlay.add(btn);
            return btn;
        });

        // 仕切り線
        const divLine = this.add.graphics();
        divLine.lineStyle(1, 0x223344).lineBetween(30, 62, 770, 62);
        overlay.add(divLine);

        // 初期ページ描画
        _refreshTabs();
        _buildPage(activeTab, pageContainer);

        // 閉じるボタン
        const closeBtn = this.add.text(400, 570, '× 閉じる', {
            fontSize: '18px', color: '#778899',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover',  () => closeBtn.setStyle({ color: '#ffffff' }));
        closeBtn.on('pointerout',   () => closeBtn.setStyle({ color: '#778899' }));
        closeBtn.on('pointerdown',  () => overlay.destroy());
        overlay.add(closeBtn);
    }

    // ── 遊び方ページ ──────────────────────────────────────

    _buildRulesPage(container) {
        const scene = this;
        const LEFT  = 50;
        const RIGHT = 430;

        // ── 左列: 基本ルール ──

        _sectionTitle(LEFT, 80, '基本ルール');

        _row(LEFT, 108, '目的',
            '地雷以外のマスをすべて開封するとステージクリア。');
        _row(LEFT, 136, '左クリック',
            'マスを開封する。');
        _row(LEFT, 160, '右クリック',
            '旗を立てる / 外す。');
        _row(LEFT, 184, '数字マス',
            '周囲 8 マスにある地雷の個数を示す。');
        _row(LEFT, 208, '空白マス',
            '周囲に地雷がない。連鎖的に周囲が自動開封される。');
        _row(LEFT, 240, '★マス',
            '開封するとカードを 1 枚入手できる。');

        _sectionTitle(LEFT, 275, 'ジャミング');
        container.add(scene.add.text(LEFT, 298,
            'ステージが進むとクリック座標がランダムにずれる「ジャミング」が\n発生する。旗やカードを活用して対処しよう。',
            { fontSize: '12px', color: '#b8cce0', lineSpacing: 4 }
        ));

        _sectionTitle(LEFT, 345, 'プレイ時間の目安');
        _tableHeader(LEFT, 368, ['', '1ステージ', '全5ステージ'], [90, 90, 110]);
        _tableRow(LEFT, 390, ['初心者',   '5〜10分', '40〜60分'], [90, 90, 110], 0x0d1a2e);
        _tableRow(LEFT, 410, ['慣れた人', '2〜4分',  '15〜25分'], [90, 90, 110], 0x0a1020);
        container.add(scene.add.text(LEFT, 434,
            '※ジャミング・リヴァイブ所持の有無で大きく変動します。',
            { fontSize: '11px', color: '#556677' }
        ));

        // ── 右列: ステージ構成 ──

        _sectionTitle(RIGHT, 80, 'ステージ構成');
        _tableHeader(RIGHT, 104, ['ST', '盤面', '地雷', '手札', 'JAM'], [28, 68, 42, 42, 42]);
        const stageData = [
            ['1', '9×9',   '10個', '2枚', 'なし'],
            ['2', '12×12', '20個', '3枚', '5%'],
            ['3', '15×15', '35個', '4枚', '10%'],
            ['4', '18×18', '55個', '6枚', '15%'],
            ['5', '22×22', '85個', '8枚', '20%'],
        ];
        stageData.forEach((row, i) => {
            _tableRow(RIGHT, 126 + i * 22, row, [28, 68, 42, 42, 42], i % 2 === 0 ? 0x0d1a2e : 0x0a1020);
        });

        // ── ヘルパー関数 ──

        function _sectionTitle(x, y, text) {
            const t = scene.add.text(x, y, text, {
                fontSize: '14px', color: '#4488ff', fontStyle: 'bold',
            });
            const g = scene.add.graphics();
            g.lineStyle(1, 0x224466).lineBetween(x, y + 18, x + 330, y + 18);
            container.add([g, t]);
        }

        function _row(x, y, label, desc) {
            container.add(scene.add.text(x, y, `▸ ${label}`, { fontSize: '12px', color: '#7aabdd', fontStyle: 'bold' }));
            container.add(scene.add.text(x + 90, y, desc, { fontSize: '12px', color: '#b8cce0', wordWrap: { width: 290 } }));
        }

        function _tableHeader(x, y, cols, widths) {
            const g = scene.add.graphics();
            g.fillStyle(0x1a2a44).fillRect(x, y, widths.reduce((a, b) => a + b, 0), 18);
            container.add(g);
            let cx = x + 4;
            cols.forEach((col, i) => {
                container.add(scene.add.text(cx, y + 2, col, { fontSize: '11px', color: '#88aacc', fontStyle: 'bold' }));
                cx += widths[i];
            });
        }

        function _tableRow(x, y, cols, widths, bgColor) {
            const g = scene.add.graphics();
            g.fillStyle(bgColor).fillRect(x, y, widths.reduce((a, b) => a + b, 0), 20);
            container.add(g);
            let cx = x + 4;
            cols.forEach((col, i) => {
                container.add(scene.add.text(cx, y + 3, col, { fontSize: '11px', color: '#c0d0e0' }));
                cx += widths[i];
            });
        }
    }

    // ── カード一覧ページ ──────────────────────────────────

    _buildCardsPage(container) {
        const cards = Object.values(CARDS);
        const count = cards.length;
        // カード数に応じた配置（現在3枚：上段2枚 + 下段中央1枚）
        const positions = count <= 2
            ? [{ x: 205, y: 290 }, { x: 595, y: 290 }]
            : count === 3
                ? [{ x: 205, y: 200 }, { x: 595, y: 200 }, { x: 400, y: 400 }]
                : [{ x: 205, y: 200 }, { x: 595, y: 200 }, { x: 205, y: 410 }, { x: 595, y: 410 }];

        cards.forEach((def, i) => {
            const { x, y } = positions[i];
            const theme    = CARD_THEMES[def.id];
            const typeMeta = TYPE_META[def.type] ?? { label: '', color: '#ffffff' };
            const PW = 340, PH = 185;

            const panel = this.add.graphics();
            panel.fillStyle(theme.bg).fillRoundedRect(x - PW / 2, y - PH / 2, PW, PH, 10);
            panel.fillStyle(theme.mid, 0.5).fillRoundedRect(x - PW / 2, y - PH / 2, PW, PH / 2, 10);
            panel.lineStyle(1.5, theme.border).strokeRoundedRect(x - PW / 2, y - PH / 2, PW, PH, 10);
            panel.lineStyle(2, theme.accent).lineBetween(x - PW / 2 + 10, y - PH / 2 + 1, x + PW / 2 - 10, y - PH / 2 + 1);
            container.add(panel);

            container.add(this.add.text(x - PW / 2 + 30, y, theme.icon, {
                fontSize: '30px', color: theme.iconColor, fontStyle: 'bold',
            }).setOrigin(0.5));

            container.add(this.add.text(x - PW / 2 + 70, y - 42, def.name, {
                fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
            }).setOrigin(0, 0.5));

            container.add(this.add.text(x - PW / 2 + 70, y - 20, typeMeta.label, {
                fontSize: '11px', color: typeMeta.color,
            }).setOrigin(0, 0.5));

            container.add(this.add.text(x - PW / 2 + 16, y + 6, def.desc, {
                fontSize: '12px', color: '#b8cce0',
                wordWrap: { width: PW - 32, useAdvancedWrap: true },
            }));
        });
    }
}
