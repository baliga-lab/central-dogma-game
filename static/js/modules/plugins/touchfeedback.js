/**
 * Class representing the touch feedback plugin
 * @extends Phaser.Plugins.ScenePlugin
 */
class TouchFeedback extends Phaser.Plugins.ScenePlugin {
    /**
     * Creates a touch feedback instance
     * @param {Phaser.Scene} scene - scene that use the plugin
     * @param {Phaser.Plugins.PluginManager} pluginManager - plugin manager
     */
    constructor (scene, pluginManager) {
        super(scene, pluginManager);
    }

    /**
     * Initializes the class when the scene starts
     */
    boot() {
        this.scene.events.on("start", this.bindFn(this.start));
    }

    /**
     * Registers touch events
     */
    start() {
        this.scene.input.on("pointerdown", this.bindFn(this.startFeedBack));
        this.scene.input.on("pointermove", this.bindFn(this.moveFeedBack));

        this.rateLimitHit = false;
    }

    /**
     * Starts the circle feedback
     * @param {Phaser.Input.InputPlugin} inputPlugin - input
     * @param {Phaser.Input.Pointer} pointer - The pointer
     * @param {Object} objClicked - Any object clicked
     */
    startFeedBack(inputPlugin, pointer, objClicked) {
        this.createGrowingCir(pointer.x, pointer.y);
        this.createParticles(pointer.x, pointer.y, 5);
    }

    /**
     * Handles the move feedback when continuing hold
     * @param {Phaser.Input.InputPlugin} inputPlugin - input
     * @param {Phaser.Input.Pointer} pointer - The pointer
     * @param {Object} objHovered - Any object hovered
     */
    moveFeedBack(inputPlugin, pointer, objHovered) {
        if (pointer.primaryDown && !this.rateLimitHit) {
            this.rateLimitHit = true;
            this.createParticles(pointer.x, pointer.y, 1);
            this.resetRateLimit();
        }
    }

    /**
     * Resets the move rate limit. Prevent spamming the particles
     */
    resetRateLimit() {
        let that = this;
        this.scene.time.addEvent({
            delay: 90,
            loop: false,
            callback: function () {
                that.rateLimitHit = false;
            },
        });
    }

    /**
     * Creates a growing circle at the given point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    createGrowingCir(x, y) {
        let img = this.scene.add.image(x, y, "touch_feedback_circle").setScale(0.05).setAlpha(0.75).setDepth(10000);
        this.grow(img);
        this.fadeOut(img);
    }

    /**
     * Create particles on the given x y coord
     * @param {number} x - x coord
     * @param {number} y - y coord
     * @param {number} amt - num of particles to spawn
     */
    createParticles(x, y, amt) {
        let touchFeedbackPartConf = {
            x: 0,
            y: 0,
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            active: false,
            lifespan: 800
        }
        let partGr = this.scene.add.particles("touch_feedback_green_spark").createEmitter(touchFeedbackPartConf);
        partGr.manager.setDepth(10000);
        let partYell = this.scene.add.particles("touch_feedback_yellow_spark").createEmitter(touchFeedbackPartConf);
        partYell.manager.setDepth(10000);

        partGr.setPosition(x, y);
        partYell.setPosition(x, y);
        partGr.resume();
        partYell.resume();
        partGr.explode(amt);
        partYell.explode(amt);
    }

    /**
     * Grow the image object bigger and bigger
     * @param {Phaser.GameObjects.Image} img - image to grow bigger
     */
    grow(img) {
        if (img.scale >= 0.35) {
            return;
        } else {
            let scale = img.scale + 0.015;
            img.setScale(scale);
            let that = this;
            this.scene.time.addEvent({
                delay: 10,
                loop: false,
                callback: function () {
                    that.grow(img);
                },
            });
        }
    }

    /**
     * Fade out image object
     * @param {Phaser.GameObjects.Image} img - image to fade
     */
    fadeOut(img) {
        if (img.alpha <= 0) {
            img.destroy();
        } else {
            let alpha = img.alpha - 0.02;
            img.setAlpha(alpha);
            let that = this;
            this.scene.time.addEvent({
                delay: 10,
                loop: false,
                callback: function () {
                    that.fadeOut(img);
                },
            });
        }
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

export default TouchFeedback;
