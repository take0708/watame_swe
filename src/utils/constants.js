export const STAGES = [
    { level: 1, cols: 9,  rows: 9,  mines: 10, cards: 2, jamRate: 0.00 },
    { level: 2, cols: 12, rows: 12, mines: 20, cards: 3, jamRate: 0.05 },
    { level: 3, cols: 15, rows: 15, mines: 35, cards: 4, jamRate: 0.10 },
    { level: 4, cols: 18, rows: 18, mines: 55, cards: 6, jamRate: 0.15 },
    { level: 5, cols: 22, rows: 22, mines: 85, cards: 8, jamRate: 0.20 },
];

export const CARDS = {
    MINE_SEARCH_1: { id: 'MINE_SEARCH_1', name: 'マインサーチ1', count: 1 },
    MINE_SEARCH_3: { id: 'MINE_SEARCH_3', name: 'マインサーチ3', count: 3 },
    REVIVE:        { id: 'REVIVE',        name: 'リヴァイブ',    passive: true },
    MINE_MOVE:     { id: 'MINE_MOVE',     name: 'マインムーブ',  targeted: true },
};

export const MAX_HAND_SIZE = 4;
export const CELL_SIZE = 32; // px
