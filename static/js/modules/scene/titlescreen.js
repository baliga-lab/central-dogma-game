/**
 * Represents the title screen
 * @extends Phaser.Scene
 */
class TitleScreen extends Phaser.Scene {
    /**
     * Creates a title screen scene
     * @param {Phaser.Types.Scenes.SettingsConfig} config 
     */
    constructor (config) {
        super(config);
    }

    /**
     * Creates the title screen with animations
     * @param {JSON} data 
     */
    init(data) {
        this.skipToLevelsList = false;
        if (data.skipToLevelsList) {
            this.skipToLevelsList = true;
        }

        this.gameObj = data.gameObj;
        this.game = this;
        this.camera = this.game.cameras.cameras[0];
        this.graphics = this.game.add.graphics();

        if (data.fadeIn) {
            this.camera.fadeIn(1000);
        }
        
        this.playedIntro = false;

        // Background color
        this.graphics.fillStyle(0xF1F1F2, 1.0);
        this.graphics.fillRect(0, 0, 360, 740);
        this.game.add.image(180, 360, "bg");

        let isblogo = this.game.add.image(180, 320, "logo_isb").setScale(0.35);
        this.isblogo = this.game.add.image(280, 30, "logo_isb").setScale(0.20).setAlpha(0);

        let dogmaLogo = this.game.add.sprite(185, 280, "logo_dogma_intro", 0).setScale(1.4);
        this.dogmaLogo = dogmaLogo;

        // Menu Buttons
        this.playBtn = this.game.add.image(180, 500, "play_btn").setScale(0.5).setAlpha(0).setInteractive();
        this.playBtn.setVisible(false);
        this.playBtn.addListener("pointerup", this.bindFn(this.onPlayClick));
        this.playBtn.addListener("pointerdown", this.bindFn(this.onPlayClickHold));
        this.playBtn.addListener("pointerup", this.bindFn(this.onPlayClickRelease));
        this.playBtn.addListener("dragend", this.bindFn(this.onPlayClickRelease));

        let animDelay = 1;
        if (this.skipToLevelsList) {
            animDelay = 0;
            this.onPlayClick();
        }

        this.input.on("pointerdown", this.bindFn(this.displayUI));

        let that = this;
        this.game.time.addEvent({
            delay: 1000 * animDelay,
            callback: function () {
                that.fadeOut(isblogo, function () {
                    that.game.anims.create({
                        key: "logo_dogma_anim",
                        frames: that.game.anims.generateFrameNumbers("logo_dogma_intro", null),
                        frameRate: 30,
                        repeat: 0,
                        delay: 500  * animDelay
                    });
                    dogmaLogo.anims.play("logo_dogma_anim");
                    that.introWaitTimer = that.game.time.addEvent({
                        delay: 3600  * animDelay,
                        callback: function () {
                            that.displayUI();
                        },
                        loop: false
                    });
                }, that.skipToLevelsList);
            },
            loop: false
        });
    }

    /**
     * Display the UI (button) so game may be started faster
     */
    displayUI() {
        if (this.playedIntro) {
            return;
        }
        this.playBtn.setVisible(true);
        this.playedIntro = true;
        this.fadeIn(this.playBtn);
        this.fadeIn(this.isblogo);
    }

    /**
     * Fade in object
     * @param {Phaser.GameObjects.Image} image - Image to fade in
     * @param {function} [callback=null] - function to run when done fading
     */
    fadeIn(image, callback=null) {
        let currentAlpha = image.alpha;
        if (currentAlpha == 0) {
            currentAlpha = 0.0001;
        }
        let newAlpha = currentAlpha * 1.5;
        if (newAlpha > 0.999) {
            image.clearAlpha();
            if (callback != null) {
                callback(image);
            }
        } else {
            image.setVisible(true);
            image.setAlpha(newAlpha);
            let that = this;
            this.game.time.addEvent({
                delay: 40,
                callback: function () {
                    that.fadeIn(image, callback);
                },
                loop: false
            });
        }
    }

    /**
     * Fade out object
     * @param {Phaser.GameObjects.Image} image - Image to fade out
     * @param {function} [callback=null] - function to run when done fading
     * @param {boolean} [skip=false] - if fading out should be skipped entirely
     */
    fadeOut(image, callback=null, skip=false) {
        let currentAlpha = image.alpha;
        let newAlpha = currentAlpha / 1.5;
        if (newAlpha < 0.001 || skip) {
            image.clearAlpha();
            image.setVisible(false);
            if (callback != null) {
                callback(image);
            }
        } else {
            image.setAlpha(newAlpha);
            let that = this;
            this.game.time.addEvent({
                delay: 40,
                callback: function () {
                    that.fadeOut(image, callback);
                },
                loop: false
            });
        }
    }

    /**
     * Show list of levels
     * @param {Phaser.GameObjects.Image} img - the play button
     */
    onPlayClick(img) {
        let that = this;
        this.fadeOut(this.playBtn, function () {
            that.playBtn.setVisible(false);
        });
        this.playBtn.removeListener("pointerup");
        this.playBtn.removeListener("pointerdown");
        this.playBtn.removeListener("pointerup");
        this.playBtn.removeListener("dragend");

        this.fadeOut(this.dogmaLogo);

        this.scene.launch("listlevels");
        this.scene.moveAbove("titlescreen", "listlevels");
    }

    /**
     * Make play button smaller
     * @param {Phaser.GameObjects.Image} img - the play button
     */
    onPlayClickHold(img) {
        this.playBtn.setScale(0.25);
    }

    /**
     * Make play button regular sized
     * @param {Phaser.GameObjects.Image} img - the play button
     */
    onPlayClickRelease(img) {
        this.playBtn.setScale(0.30);
    }

    /**
     * Changes the context of the function `this` keyword to the class. Moves the `this` reference to the first parameter instead.
     * @param {function} fn - The function used to bind to the class
     */
    bindFn(fn) {
        let clas = this;
        return function (...args) {
            let event = this;
            fn.bind(clas, event, ...args)();
        };
    }
}

export default TitleScreen;
