/**
 * Class representing the scoring in a level.
 */
class GameScore {
    /**
     * Creates a game score.
     * @param {LevelStage} game - The level scene that the score is bound to
     */
    constructor (game) {
        this.initialized = false;
        this.game = game;
        this.sequencesMade = 0;
        this.secondsElapsed = 0;
        this.wrongSequences = 0;
        this.timerSec = null;
        this.timerMs = null;
        this.initialNTCount = this.game.levelConfig.ntSequence.length;
    }

    /**
     * Initializes the game score by adding inital text to specific area in the scene.
     */
    init() {
        this.initialized = true;
        this.sequenceNTsTxt = this.game.add.text(50, 80, "0", 
            {fontFamily: '\'Open Sans\', sans-serif', fontSize: '18pt', color: '#000'}).setOrigin(0.5);
        this.updateSequenceNTs();
        let rate = this.getRate();
        this.rateTxt = this.game.add.text(140, 80, rate, 
            {fontFamily: '\'Open Sans\', sans-serif', fontSize: '18pt', color: '#000'}).setOrigin(0.5);
        this.accuracyTxt = this.game.add.text(222, 80, "100%", 
            {fontFamily: '\'Open Sans\', sans-serif', fontSize: '18pt', color: '#000'}).setOrigin(0.5);
        this.scoreTxt = this.game.add.text(307, 80, "0", 
            {fontFamily: '\'Open Sans\', sans-serif', fontSize: '18pt', color: '#000'}).setOrigin(0.5);
    }

    /**
     * Starts the scoring.
     */
    start() {
        if (!this.initialized) {
            console.error("GameScore instance has not been initialized yet!");
        }
        this.timerSec = this.game.time.addEvent({
            delay: 1000,
            callback: this.bindFn(this.tickSec),
            loop: true
        });
        this.timerMs = this.game.time.addEvent({
            delay: 50,
            callback: this.bindFn(this.tickMs),
            loop: true
        });
    }

    /**
     * Stops the scoring.
     */
    stop() {

    }

    /**
     * Updates the score counts which should be triggered on every millisec.
     */
    tickMs() {
        this.updateSequenceNTs();
        this.updateScore();
        this.updateAccuracy();
    }

    /**
     * Update the sequence NT count text.
     */
    updateSequenceNTs() {
        let count = this.getNTCount();
        this.sequenceNTsTxt.setText(count);
    }

    /**
     * Uodate the score text.
     */
    updateScore() {
        let score = this.getScore();
        this.scoreTxt.setText(score);
    }

    /**
     * Updates the accuracy text.
     */
    updateAccuracy() {
        this.accuracyTxt.setText(this.getAccuracy() + "%");
    }

    /**
     * Gets the number of nucleotides on the game.
     * @returns {number} The nucleotides count
     */
    getNTCount() {
        return this.game.positionManager.getLevelNTCount();
    }

    /**
     * Get the game speed. The smaller, the faster.
     * @returns {number} game speed
     */
    getGameSpeed() {
        return this.game.levelConfig.speed;
    }

    /**
     * Increment seconds elapsed.
     */
    tickSec() {
        this.secondsElapsed++;
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
    
    /**
     * Increment the number of wrong sequences made.
     */
    incrementIncorrectSequences() {
        this.wrongSequences++;
    }

    /** 
     * Increment the number of correct sequences made.
     */
    incrementSequencesMade() {
        this.sequencesMade++;
    }

    /**
     * Returns the rate per minute of nucleotides can be made in this level.
     * @returns {number} Nucleotides rate
     */
    getRate() {
        // let minElapsed = Math.ceil(this.secondsElapsed / 60);
        // return Math.round(this.sequencesMade / minElapsed);
        let ntRate = Math.floor(1000 / this.getGameSpeed());
        return Math.min(ntRate, this.game.levelConfig.ntSequence.length);
    }

    /**
     * Returns the current accuracy in the ongoing level.
     * @returns {number} the accuracy that the player has progressed
     */
    getAccuracy() {
        let ntCnt = this.initialNTCount;
        return Math.round(((ntCnt - this.wrongSequences) / ntCnt) * 100);
    }

    /**
     * Returns the score from the current game
     * @returns {number} the score accumulated so far
     */
    getScore() {
        return this.sequencesMade * 100;
    }
}

export default GameScore;