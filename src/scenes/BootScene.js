export default class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        this.load.image('cell_hidden',      'assets/images/cell_hidden.png');
        this.load.image('cell_0',           'assets/images/cell_0.png');
        this.load.image('cell_1',           'assets/images/cell_1.png');
        this.load.image('cell_2',           'assets/images/cell_2.png');
        this.load.image('cell_3',           'assets/images/cell_3.png');
        this.load.image('cell_4',           'assets/images/cell_4.png');
        this.load.image('cell_5',           'assets/images/cell_5.png');
        this.load.image('cell_6',           'assets/images/cell_6.png');
        this.load.image('cell_7',           'assets/images/cell_7.png');
        this.load.image('cell_8',           'assets/images/cell_8.png');
        this.load.image('cell_mine',        'assets/images/cell_mine.png');
        this.load.image('cell_flag',        'assets/images/cell_flag.png');
        this.load.image('cell_card',        'assets/images/cell_card.png');
        this.load.image('bg',               'assets/images/bg.png');
        this.load.image('card_ui_frame',    'assets/images/card_ui_frame.png');
        this.load.image('jamming_effect',   'assets/images/jamming_effect.png');
        this.load.audio('bgm',      'assets/audio/bgm.ogg');
        this.load.audio('se_open',  'assets/audio/se_open.ogg');
        this.load.audio('se_mine',  'assets/audio/se_mine.ogg');
        this.load.audio('se_jam',   'assets/audio/se_jam.ogg');
        this.load.audio('se_card',  'assets/audio/se_card.ogg');
    }

    create() {
        this.scene.start('MenuScene');
    }
}
