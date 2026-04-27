import { CARDS } from '../utils/constants.js';
import { shuffleArray, getNeighbors } from '../utils/helpers.js';

export default class Board {
    constructor(cols, rows, mineCount, cardCount) {
        this.cols = cols;
        this.rows = rows;
        this.mineCount = mineCount;
        this.flaggedCount = 0;
        this.revealedCount = 0;

        // Step 1: 配列初期化
        this.grid = [];
        for (let y = 0; y < rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < cols; x++) {
                this.grid[y][x] = {
                    x, y,
                    isMine: false,
                    isCard: false,
                    cardId: null,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0,
                };
            }
        }

        // Step 2: 地雷配置
        const allCoords = [];
        for (let y = 0; y < rows; y++)
            for (let x = 0; x < cols; x++)
                allCoords.push({ x, y });
        shuffleArray(allCoords);
        for (let i = 0; i < mineCount; i++) {
            const { x, y } = allCoords[i];
            this.grid[y][x].isMine = true;
        }

        // Step 3: カードマス配置（カード同士が隣接しないよう間隔を確保）
        const nonMine = allCoords.filter(({ x, y }) => !this.grid[y][x].isMine);
        shuffleArray(nonMine);
        const cardKeys = Object.keys(CARDS);
        let placed = 0;
        for (let i = 0; i < nonMine.length && placed < cardCount; i++) {
            const { x, y } = nonMine[i];
            // 隣接8マスにすでにカードがあればスキップ
            const hasAdjacentCard = getNeighbors(x, y, cols, rows)
                .some(({ x: nx, y: ny }) => this.grid[ny][nx].isCard);
            if (hasAdjacentCard) continue;
            this.grid[y][x].isCard = true;
            this.grid[y][x].cardId = cardKeys[Math.floor(Math.random() * cardKeys.length)];
            placed++;
        }

        // Step 4: neighborMines 計算
        this._recalcAllNeighbors();
    }

    _recalcAllNeighbors() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.grid[y][x];
                if (cell.isMine) { cell.neighborMines = 0; continue; }
                const neighbors = getNeighbors(x, y, this.cols, this.rows);
                cell.neighborMines = neighbors.filter(({ x: nx, y: ny }) => this.grid[ny][nx].isMine).length;
            }
        }
    }

    _recalcNeighborsAround(x, y) {
        const targets = [{ x, y }, ...getNeighbors(x, y, this.cols, this.rows)];
        for (const { x: tx, y: ty } of targets) {
            const cell = this.grid[ty][tx];
            if (cell.isMine) { cell.neighborMines = 0; continue; }
            const neighbors = getNeighbors(tx, ty, this.cols, this.rows);
            cell.neighborMines = neighbors.filter(({ x: nx, y: ny }) => this.grid[ny][nx].isMine).length;
        }
    }

    // TASK-06メソッド

    reveal(x, y, isFloodFill = false) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return [];
        const cell = this.grid[y][x];
        if (cell.isRevealed || cell.isFlagged) return [];
        // flood fill 時はカードマスを開かずスキップ（直接クリックは通常開封）
        if (isFloodFill && cell.isCard) return [];

        cell.isRevealed = true;
        this.revealedCount++;
        const changed = [cell];

        // 隣接に未開封カードマスがあれば flood fill をここで停止する
        // （neighborMines はカードマスを地雷としてカウントしないため、
        //   カード隣接セルが nm=0 になって連鎖を中継してしまう問題を防ぐ）
        const adjacentCard = getNeighbors(x, y, this.cols, this.rows)
            .some(({ x: nx, y: ny }) => this.grid[ny][nx].isCard && !this.grid[ny][nx].isRevealed);

        if (!cell.isMine && !cell.isCard && cell.neighborMines === 0 && !adjacentCard) {
            const neighbors = getNeighbors(x, y, this.cols, this.rows);
            for (const { x: nx, y: ny } of neighbors) {
                const more = this.reveal(nx, ny, true);
                changed.push(...more);
            }
        }
        return changed;
    }

    flag(x, y) {
        const cell = this.grid[y][x];
        if (cell.isRevealed) return false;
        cell.isFlagged = !cell.isFlagged;
        this.flaggedCount += cell.isFlagged ? 1 : -1;
        return true;
    }

    moveMine(fromX, fromY) {
        const from = this.grid[fromY][fromX];
        if (!from.isMine) return null;

        const candidates = [];
        for (let y = 0; y < this.rows; y++)
            for (let x = 0; x < this.cols; x++) {
                const c = this.grid[y][x];
                if (!c.isMine && !c.isRevealed) candidates.push(c);
            }
        if (candidates.length === 0) return null;

        const to = candidates[Math.floor(Math.random() * candidates.length)];
        from.isMine = false;
        to.isMine = true;

        this._recalcNeighborsAround(from.x, from.y);
        this._recalcNeighborsAround(to.x, to.y);

        return { from, to };
    }

    isCleared() {
        return this.revealedCount === (this.cols * this.rows - this.mineCount);
    }
}
