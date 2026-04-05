export default class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        this.add.image(400, 300, 'bg');

        this.add.text(400, 180, 'わためは悪くないよねぇ', {
            fontSize: '28px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, 225, 'デッキ構築型マインスイーパ', {
            fontSize: '16px', fill: '#aaaaaa'
        }).setOrigin(0.5);

        const startBtn = this.add.text(400, 340, 'START', {
            fontSize: '36px', fill: '#ffdd00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerover',  () => startBtn.setStyle({ fill: '#ffffff' }));
        startBtn.on('pointerout',   () => startBtn.setStyle({ fill: '#ffdd00' }));
        startBtn.on('pointerdown',  () => this._startGame());
    }

    _startGame() {
        const playerState = {
            stage: 1,
            hp: 1,
            hand: [],
        };
        this.scene.start('GameScene', { playerState });
    }
}
