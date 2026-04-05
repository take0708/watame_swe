import { clamp } from '../utils/helpers.js';

export default class Jamming {
    constructor(scene) {
        this.scene = scene;
    }

    resolve(x, y, jamRate, cols, rows) {
        if (Math.random() >= jamRate) {
            return { x, y, jammed: false };
        }
        this._playEffect();
        const offsets = [-3, -2, -1, 1, 2, 3];
        const dx = offsets[Math.floor(Math.random() * offsets.length)];
        const dy = offsets[Math.floor(Math.random() * offsets.length)];
        return {
            x: clamp(x + dx, 0, cols - 1),
            y: clamp(y + dy, 0, rows - 1),
            jammed: true,
        };
    }

    _playEffect() {
        const scene = this.scene;

        // BGMピッチダウン
        const bgm = scene.sound.get('bgm');
        if (bgm) {
            bgm.setDetune(-400);
            scene.time.delayedCall(1200, () => { if (bgm.isPlaying) bgm.setDetune(0); });
        }

        // テキスト演出
        const text = scene.add.text(400, 300, 'わためは悪くないよねぇ', {
            fontSize: '32px', fill: '#ff4444', stroke: '#000000', strokeThickness: 6,
        }).setOrigin(0.5).setDepth(100);

        // 画像演出
        const img = scene.add.image(400, 300, 'jamming_effect').setDepth(99).setAlpha(0.8);

        // SE再生
        if (scene.sound.get('se_jam') || scene.cache.audio.has('se_jam')) {
            try { scene.sound.play('se_jam'); } catch (e) {}
        }

        // フェードアウト
        scene.tweens.add({
            targets: [text, img],
            alpha: 0,
            duration: 1200,
            onComplete: () => { text.destroy(); img.destroy(); },
        });
    }
}
