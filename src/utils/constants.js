export const STAGES = [
    { level: 1, cols: 9,  rows: 9,  mines: 10, cards: 2, jamRate: 0.00 },
    { level: 2, cols: 12, rows: 12, mines: 20, cards: 3, jamRate: 0.05 },
    { level: 3, cols: 15, rows: 15, mines: 35, cards: 4, jamRate: 0.10 },
    { level: 4, cols: 18, rows: 18, mines: 55, cards: 6, jamRate: 0.15 },
    { level: 5, cols: 22, rows: 22, mines: 85, cards: 8, jamRate: 0.20 },
];

export const CARDS = {
    MINE_SEARCH_1: {
        id: 'MINE_SEARCH_1', name: 'マインサーチ1', type: 'active', count: 1,
        desc: '未開封の地雷を1個ランダムに選び、旗を立てる。',
    },
    MINE_SEARCH_3: {
        id: 'MINE_SEARCH_3', name: 'マインサーチ3', type: 'active', count: 3,
        desc: '未開封の地雷を3個ランダムに選び、旗を立てる。',
    },
    REVIVE: {
        id: 'REVIVE', name: 'リヴァイブ', type: 'passive', passive: true,
        desc: '地雷を踏んだとき自動発動し、爆発を1回無効化する。手札にあるだけで効果を発揮する。',
    },
    /* MINE_MOVE (一時無効化)
    MINE_MOVE: {
        id: 'MINE_MOVE', name: 'マインムーブ', type: 'targeted', targeted: true,
        desc: '選択した地雷マスを未開封の別マスへランダムに移動させる。使用後、移動させる地雷マスをクリックして発動。',
    },
    */
};

// カード種ごとのデザインテーマ（UIScene・MenuScene 共用）
export const CARD_THEMES = {
    MINE_SEARCH_1: { bg: 0x0d2654, mid: 0x1a3a80, accent: 0x4488ff, border: 0x6699dd, icon: '○', iconColor: '#88bbff', badge: '×1' },
    MINE_SEARCH_3: { bg: 0x0d3a3a, mid: 0x1a5555, accent: 0x44cccc, border: 0x66bbcc, icon: '○', iconColor: '#88eeff', badge: '×3' },
    REVIVE:        { bg: 0x0d3a0d, mid: 0x1a5520, accent: 0x44ff66, border: 0x66cc88, icon: '♥', iconColor: '#aaffaa', badge: ''   },
    // MINE_MOVE: { bg: 0x2a1a40, mid: 0x3d2860, accent: 0xaa66ff, border: 0x9966dd, icon: '⇄', iconColor: '#ddaaff', badge: '' }, // 一時無効化
};

// カードタイプ表示メタ
export const TYPE_META = {
    active:   { label: '【アクティブ】', color: '#4488ff' },
    passive:  { label: '【パッシブ】',   color: '#44ff66' },
    targeted: { label: '【対象指定】',   color: '#ffaa44' },
};

export const MAX_HAND_SIZE = 4;
export const CELL_SIZE = 32; // px
