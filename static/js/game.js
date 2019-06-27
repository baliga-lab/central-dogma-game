(function () {
    "use strict";

    /**
     * When called, it resizes the Canvas on the page so that
     * it would scale porportionally to the width and height.
     * That would look good on all devices width and height.
     */
    function resizeCanvas() {
        let mainWidth = 360;
        let mainHeight = 740;
        let screenWidth = window.innerWidth;
        let screenHeight = window.innerHeight;
        let tRatio = mainWidth / screenWidth;
        let tProportionalHeight = mainHeight / tRatio;
        tRatio = mainHeight / screenHeight;
        let tProportionalWidth = mainWidth / tRatio;
        if (tProportionalHeight > screenHeight) {
            mainWidth = tProportionalWidth;
            mainHeight = screenHeight;
        } else {
            mainWidth = screenWidth;
            mainHeight = tProportionalHeight;
        }
        let main = document.querySelector("main");
        main.style.height = mainHeight + "px";
        main.style.width = mainWidth + "px";
    }

    resizeCanvas();
    window.addEventListener("resize", function () {
        resizeCanvas();
    });

    class Game {
        constructor (levels) {
            this.config = {
                type: Phaser.CANVAS,
                canvas: document.getElementsByTagName("canvas")[0],
                width: 360,
                height: 740,
                backgroundColor: "#fff",
                scene: {
                    preload: this.bindFn(this.preload),
                    create: this.bindFn(this.create),
                }
            }
            this.scorekeeping = null;
            this.levels = levels;
            this.level = 0;
            this.objects = {};
            this.nucleotides = [];
            this.ntButtons = [];
            this.btnLocations = {
                0: [310, 400],
                1: [310, 450]
            }
            this.ntBtnsEnabled = true;
        }

        bindFn(fn) {
            let clas = this;
            return function (...args) {
                let event = this;
                fn.bind(clas, event, ...args)();
            };
        }

        preload(gameObj) {
            this.game = gameObj;
            this.game.load.image("logo_dogma", "static/img/DOGMA_logo.png");
            this.game.load.image("logo_isb", "static/img/ISB_Logo.png");
            
            this.game.load.image("nt_adenine_backbone", "static/img/nucleotide/adenine/Adenine_Backbone@3x.png");
            this.game.load.image("nt_adenine_basic", "static/img/nucleotide/adenine/Adenine_basic@3x.png");
            this.game.load.image("nt_adenine_hbonds", "static/img/nucleotide/adenine/Adenine_Hbonds@3x.png");

            this.game.load.image("nt_thymine_backbone", "static/img/nucleotide/thymine/Thymine_Backbone@3x.png");
            this.game.load.image("nt_thymine_basic", "static/img/nucleotide/thymine/Thymine_basic@3x.png");
            this.game.load.image("nt_thymine_hbonds", "static/img/nucleotide/thymine/Thymine_Hbonds@3x.png");
            this.scorekeeping = new GameScore(this.game);
        }

        create() {
            this.camera = this.game.cameras.cameras[0];
            this.graphics = this.game.add.graphics();
            this.game.add.image(75, 30, "logo_dogma").setScale(0.15);
            this.game.add.image(300, 22, "logo_isb").setScale(0.15);
            
            this.graphics.fillStyle(0xF1F1F2, 1.0);
            this.graphics.fillRect(0, 100, 360, 640);

            this.graphics.fillStyle(0xE5F7FD, 1.0);
            this.graphics.fillRect(15, 50, 75, 45);

            this.graphics.fillStyle(0xEFEAF4, 1.0);
            this.graphics.fillRect(100, 50, 75, 45);

            this.graphics.fillStyle(0xF3F9EC, 1.0);
            this.graphics.fillRect(185, 50, 75, 45);

            this.graphics.fillStyle(0xFDE8E9, 1.0);
            this.graphics.fillRect(270, 50, 75, 45);

            this.leftHighlightCir = this.game.add.circle(80, 490, 50, 0xfffaa8, 0);

            this.rightHighlightCir = this.game.add.circle(210, 534, 47, 0xfffaa8, 0);

            this.game.add.text(18, 53, "Sequence NTs", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

            this.game.add.text(102, 53, "Rate [NTs/min]", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

            this.game.add.text(200, 53, "Accuracy", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

            this.game.add.text(293, 53, "Score", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

            this.game.add.text(4, 105, "5'", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});
            
            this.game.add.text(4, 150, "3'", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

            this.game.add.text(345, 105, "3'", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

            this.game.add.text(4, 530, "5'", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

            this.game.add.text(230, 440, "5'", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

            this.game.add.text(340, 690, "3'", 
                {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

            let nucleotides = this.levels[this.level].ntSequence;
            for (let i = 0; i < nucleotides.length; i++) {
                let nucleotide = new Nucleotide(this.game, nucleotides[i], "basic");
                this.nucleotides.push(nucleotide);
            }
            
            this.positionManager = new PositionManager(this, this.nucleotides);
            this.positionManager.setPositions(false);

            this.makeNTBtn("T");
            this.makeNTBtn("A");

            this.scorekeeping.start();

            this.positionManager.start();
        }

        makeNTBtn(type) {
            let nt = new Nucleotide(this.game, type, "basic");
            nt.setDisplay("nucleotide");
            nt.setVisible(true);
            nt.setPosition(this.btnLocations[this.ntButtons.length][0], this.btnLocations[this.ntButtons.length][1]);
            nt.getObject().setScale(0.15);
            nt.getObject().setInteractive();
            this.game.input.setDraggable(nt.getObject());
            this.game.input.on("dragstart", this.bindFn(this.onDragNTBtnStart));
            this.game.input.on("drag", this.bindFn(this.onDragNTBtn));
            this.game.input.on("dragend", this.bindFn(this.onDragNTBtnEnd));
            this.ntButtons.push(nt);
        }

        onDragNTBtnStart (input, pointer, image) {
            if (!this.ntBtnsEnabled) {
                return;
            }
            let leftButtonDown = pointer.leftButtonDown();
            if (!leftButtonDown) {
                return;
            }
            let x = pointer.x;
            let y = pointer.y;
            let angle = image.angle;
            image.setData("pointerStartX", x);
            image.setData("pointerStartY", y);
            image.setData("startAngle", angle);
            image.setData("startedDragging", true);
        }

        onDragNTBtn (input, pointer, image, x, y) {
            if (!this.ntBtnsEnabled) {
                return;
            }
            let startedDragging = image.getData("startedDragging");
            if (!startedDragging) {
                return;
            }
            let leftButtonDown = pointer.leftButtonDown();
            if (!leftButtonDown) {
                return;
            }
            let imgX = image.getData("pointerStartX");
            let imgY = image.getData("pointerStartY");
            let pointerX = x;
            let pointerY = y;
            let distance = Math.sqrt(Math.pow(pointerX - imgX, 2) + Math.pow(pointerY - imgY, 2));
            let startAngle = image.getData("startAngle");
            image.setAngle(startAngle + distance);
        }

        onDragNTBtnEnd (input, pointer, image) {
            let startedDragging = image.getData("startedDragging");
            if (!startedDragging) {
                return;
            }
            if (!this.ntBtnsEnabled) {
                return;
            }
            let angle = image.angle;
            console.log(angle);
            let clickedNT = image.getData("nucleotide");
            let headNT = this.positionManager.getHeadNucleotide();
            let cloned = clickedNT.clone();
            cloned.setDisplay("nucleotide");
            cloned.setPosition(clickedNT.getObject().x, clickedNT.getObject().y);
            cloned.setVisible(true);
            cloned.getObject().setScale(0.18);
            this.ntBtnsEnabled = false;
            if (clickedNT.validMatchWith(headNT)) {
                this.positionManager.addToDNAOutput(cloned);
            } else {
                this.positionManager.doRejectNT(cloned);
            }
            image.setAngle(0);
            image.startedDragging = false;
        }
    }

    class PositionManager {
        constructor (gameObj, levelNucleotides) {
            this.autoMoveTimer = null;
            this.pathPointsFactor = 60;
            this.gameObj = gameObj;
            this.game = gameObj.game;
            this.levelNucleotides = [];
            for (let i = 0; i < levelNucleotides.length * this.pathPointsFactor; i++) {
                let prevIdx = Math.floor((i - 1) / this.pathPointsFactor);
                let currIdx = Math.floor(i / this.pathPointsFactor);
                let nextIdx = Math.floor((i + 1) / this.pathPointsFactor);
                if (currIdx === nextIdx) {
                    this.levelNucleotides.push(null);
                    continue;
                }
                this.levelNucleotides.push(levelNucleotides[currIdx]);
            }
            this.compLevelNucleotides = [];
            let paddingComp = 8 * this.pathPointsFactor;
            for (let i = 0; i < paddingComp; i++) {
                this.compLevelNucleotides.push(null);
            }
            for (let i = 0; i < this.levelNucleotides.length; i++) {
                let prevIdx = Math.floor((i - 1) / this.pathPointsFactor);
                let currIdx = Math.floor(i / this.pathPointsFactor);
                let nextIdx = Math.floor((i + 1) / this.pathPointsFactor);
                if (currIdx === nextIdx) {
                    this.compLevelNucleotides.push(null);
                    continue;
                }
                let nucleotide = this.levelNucleotides[i];
                let newcleotide = new Nucleotide(this.game, nucleotide.matches[0], "basic");
                this.compLevelNucleotides.push(newcleotide);
            }
            this.selectedNucleotides = [];

            this.gameObj.graphics.lineStyle(1, 0x6c757d, 0.6);
            this.inputRowPath = new Phaser.Curves.Path(0, 140);
            this.inputRowPath.lineTo(175, 140);
            this.inputRowPath.draw(this.gameObj.graphics);
            this.initRectPathPts = this.inputRowPath.getSpacedPoints(13 * this.pathPointsFactor);
            this.inputComplRowPath = new Phaser.Curves.Path(0, 126);
            this.inputComplRowPath.lineTo(363.46153846153845, 126);
            this.inputComplRowPath.draw(this.gameObj.graphics);
            this.inputCompRectPathPts = this.inputComplRowPath.getSpacedPoints(27 * this.pathPointsFactor);
            this.inputVertPath = new Phaser.Curves.Path(182, 147);
            this.inputVertPath.cubicBezierTo(25, 640, 320, 320, 15, 440);
            // this.inputVertPath.draw(this.gameObj.graphics);
            let numVertPathPts = 7 * this.pathPointsFactor;
            this.initVertPathPts = this.inputVertPath.getPoints(numVertPathPts + this.pathPointsFactor).slice(0, numVertPathPts - this.pathPointsFactor);
            this.inputVertPathDispl = new Phaser.Curves.Path(182, 147);
            this.inputVertPathDispl.cubicBezierTo(-30, 640, 280, 320, -80, 440);
            this.inputVertPathDispl.draw(this.gameObj.graphics);
            this.outputVertPath = new Phaser.Curves.Path(245, 450);
            this.outputVertPath.cubicBezierTo(145, 710, 180, 600, 100, 700);
            // this.outputVertPath.draw(this.gameObj.graphics);
            this.outputVertPathPts = this.outputVertPath.getPoints(5 * this.pathPointsFactor);
            this.outputVertPathDispl = new Phaser.Curves.Path(285, 500);
            this.outputVertPathDispl.cubicBezierTo(145, 710, 250, 600, 130, 670);
            this.outputVertPathDispl.draw(this.gameObj.graphics);
            this.outputRowPath = new Phaser.Curves.Path(155, 710);
            this.outputRowPath.lineTo(400, 710);
            this.outputRowPath.draw(this.gameObj.graphics);
            this.outputRowPathPts = this.outputRowPath.getPoints(30 * this.pathPointsFactor);
        }

        setPositions(animate=true) {
            let inputCompRectPathPts = this.inputCompRectPathPts.slice().reverse();
            for (let i = 0; i < inputCompRectPathPts.length; i++) {
                let x = inputCompRectPathPts[i].x;
                let y = inputCompRectPathPts[i].y;
                let nucleotide = this.compLevelNucleotides[i];
                if (!nucleotide) {
                    continue;
                }
                nucleotide.setVisible(true);
                if (animate) {
                    this._animatePosition(nucleotide, x, y);
                } else {
                    nucleotide.setPosition(x, y);
                }
            }
            let initVertPathPts = this.initVertPathPts.slice().reverse();
            for (let i = 0; i < initVertPathPts.length; i++) {
                let x = initVertPathPts[i].x;
                let y = initVertPathPts[i].y;
                let nucleotide = this.levelNucleotides[i];
                if (!nucleotide) {
                    continue;
                }
                nucleotide.setDisplay("nucleotide");
                nucleotide.setVisible(true);
                if (animate) {
                    this._animatePosition(nucleotide, x, y);
                } else {
                    nucleotide.setPosition(x, y);
                }
                // (0, 3/10) (180, 1/20) len(initVertPathPts)==180
                let scale = 0.3 - (1/1440) * i;
                let scalePrev = 0.3 - (1/1440) * (i - 1);
                if (animate) {
                    nucleotide.getObject().setScale(scalePrev);
                    this._animateScale(nucleotide, scale);
                } else {
                    nucleotide.getObject().setScale(scale);
                }
            }
            let initRectPathPts = this.initRectPathPts.slice().reverse();
            for (let i = 0; i < initRectPathPts.length; i++) {
                let x = initRectPathPts[i].x;
                let y = initRectPathPts[i].y;
                let nucleotide = this.levelNucleotides[initVertPathPts.length + i];
                if (!nucleotide) {
                    continue;
                }
                if (animate) {
                    this._animatePosition(nucleotide, x, y);
                } else {
                    nucleotide.setPosition(x, y);
                }
                nucleotide.setVisible(true);
            }
            let selectedNucleotides = this.selectedNucleotides.slice().reverse();
            let outputVertPathPts = this.outputVertPathPts.slice(2, this.outputVertPathPts.length);
            for (let i = 0; i < outputVertPathPts.length; i++) {
                let nucleotide = selectedNucleotides[i];
                if (!nucleotide) {
                    continue;
                }
                let x = outputVertPathPts[i].x;
                let y = outputVertPathPts[i].y;
                if (animate) {
                    this._animatePosition(nucleotide, x, y);
                } else {
                    nucleotide.setPosition(x, y);
                }
                let idx = Math.floor(i / this.pathPointsFactor);
                // (0, 0.2) (299, 0.07) len(outputVertPathPts)=299
                let scale = 0.2 - (1/2300) * i;
                let scalePrev = 0.2 - (1/2300) * (i - 1);
                if (animate) {
                    nucleotide.getObject().setScale(scalePrev);
                    this._animateScale(nucleotide, scale);
                } else {
                    nucleotide.getObject().setScale(scale);
                }
            }
            let outputRectPathsPts = this.outputRowPathPts.slice();
            for (let i = 0; i < outputRectPathsPts.length; i++) {
                let nucleotide = selectedNucleotides[outputVertPathPts.length + i];
                if (!nucleotide) {
                    continue;
                }
                let x = outputRectPathsPts[i].x;
                let y = outputRectPathsPts[i].y;
                nucleotide.setDisplay("rectangle");
                if (animate) {
                    this._animatePosition(nucleotide, x, y);
                } else {
                    nucleotide.setPosition(x, y);
                }
            }
        }

        start() {
            this.startTimer();
        }

        startTimer() {
            let that = this;
            this.autoMoveTimer = this.game.time.addEvent({
                delay: 20,
                callback: function () {that.next();},
                loop: true
            });
        }

        stopTimer() {
            if (this.autoMoveTimer) {
                this.autoMoveTimer.remove();
                this.autoMoveTimer = null;
            }
        }

        _animatePosition(nucleotide, x, y, callback=null) {
            let fromX = nucleotide.getObject().x;
            let toX = x;
            let fromY = nucleotide.getObject().y;
            let toY = y;
            if (Math.abs(fromX - toX) < 1 && Math.abs(fromY - toY) < 1) {
                nucleotide.setPosition(toX, toY);
                if (callback != null) {
                    callback(nucleotide);
                }
            } else {
                let that = this;
                this.game.time.addEvent({
                    delay: 20,
                    callback: function () {
                        let midX = (fromX + toX) / 2;
                        let midY = (fromY + toY) / 2;
                        nucleotide.setPosition(midX, midY);
                        that._animatePosition(nucleotide, x, y, callback);
                    },
                    loop: false
                });
            }
        }

        _animateScale(nucleotide, scale, callback=null) {
            let fromScale = nucleotide.getObject().scale;
            let toScale = scale;
            if (fromScale === undefined) {
                fromScale = nucleotide.getObject().scaleX;
            }
            if (Math.abs(fromScale - toScale) < 0.001) {
                nucleotide.getObject().setScale(scale);
                if (callback != null) {
                    callback(nucleotide);
                }
            } else {
                let that = this;
                this.game.time.addEvent({
                    delay: 40,
                    callback: function () {
                        let midScale = (fromScale + toScale) / 2;
                        nucleotide.getObject().setScale(midScale);
                        that._animateScale(nucleotide, scale, callback);
                    },
                });
            }
        }

        _fadeOut(nucleotide, callback=null) {
            let currentAlpha = nucleotide.getObject().alpha;
            let newAlpha = currentAlpha / 1.5;
            if (newAlpha > 5) {
                nucleotide.getObject().clearAlpha();
                nucleotide.setVisible(false);
                if (callback != null) {
                    callback(nucleotide);
                }
            } else {
                nucleotide.getObject().setAlpha(newAlpha);
                let that = this;
                this.game.time.addEvent({
                    delay: 40,
                    callback: function () {
                        that._fadeOut(nucleotide);
                    },
                    loop: false
                });
            }
        }

        next() {
            let relHead = this.getHeadNucleotide();
            if (relHead) {
                this.gameObj.leftHighlightCir.setFillStyle(0xfffaa8, 1);
                this.gameObj.rightHighlightCir.setFillStyle(0xfffaa8, 1);
            } else {
                this.gameObj.leftHighlightCir.setFillStyle(0xfffaa8, 0);
                this.gameObj.rightHighlightCir.setFillStyle(0xfffaa8, 0);
            }
            let head = this.levelNucleotides[0];
            if (head) {
                this.removeHeadNucleotide();
                console.log("Removed head nucleotide at the very end");
            }
            this.levelNucleotides = this.levelNucleotides.slice(1, this.levelNucleotides.length);
            this.compLevelNucleotides = this.compLevelNucleotides.slice(1, this.compLevelNucleotides.length);
            this.selectedNucleotides.push(null);
            this.setPositions(true);
        }

        removeHeadNucleotide() {
            for (let i = 0; i < this.pathPointsFactor; i++) {
                let removed = this.levelNucleotides[i];
                if (removed) {
                    this.levelNucleotides[i] = null;
                    this._animatePosition(removed, removed.getObject().x - 40, removed.getObject().y + 130);
                    this._fadeOut(removed, function () {
                        removed.destroy();
                    });
                    break;
                }
            }
        }

        getHeadNucleotide() {
            if (this.levelNucleotides.length) {
                for (let i = 0; i < this.pathPointsFactor; i++) {
                    if (this.levelNucleotides[i] != null) {
                        return this.levelNucleotides[i];
                    }
                }
            }
            return null;
        }

        addToDNAOutput(nucleotide) {
            nucleotide.getObject().setScale(0.3);
            let firstPoint = this.outputVertPathPts[0];
            let secPoint = this.outputVertPathPts[1 * this.pathPointsFactor];
            let point = this.outputVertPathPts[2 * this.pathPointsFactor];
            nucleotide.setPosition(firstPoint.x, firstPoint.y);
            // this.stopTimer();
            let that = this;
            this._animatePosition(nucleotide, secPoint.x, secPoint.y, function () {
                that._animatePosition(nucleotide, point.x, point.y);
                that.selectedNucleotides.push(nucleotide);
                for (let i = 0; i < (that.pathPointsFactor * 2); i++) {
                    that.selectedNucleotides.push(null);
                }
                // that.startTimer();
                that.gameObj.ntBtnsEnabled = true;
                that.removeHeadNucleotide();
            });
        }

        doRejectNT(nucleotide) {
            nucleotide.getObject().setScale(0.3);
            let firstPoint = this.outputVertPathPts[0];
            let secPoint = this.outputVertPathPts[1 * this.pathPointsFactor];
            nucleotide.setPosition(firstPoint.x, firstPoint.y);
            this.gameObj.camera.flash(300, 255, 30, 30);
            this.gameObj.camera.shake(400, 0.01);
            let that = this;
            this._animatePosition(nucleotide, secPoint.x, secPoint.y, function () {
                that._fadeOut(nucleotide);
                that._animatePosition(nucleotide, firstPoint.x, firstPoint.y, function () {
                    that.gameObj.ntBtnsEnabled = true;
                    nucleotide.destroy();
                });
            });
        }
    }

    
    class GameScore {
        constructor (game) {
            this.game = game;
            this.sequencesMade = 0;
            this.secondsElapsed = 0;
            this.wrongSequences = 0;
            this.timer = null;
        }

        start() {
            this.timer = this.game.time.addEvent({
                delay: 1000,
                callback: this.tick,
                loop: true
            });
        }

        stop() {

        }

        tick() {
            this.secondsElapsed++;
            //console.log("tick")
        }

        incrementSequences(correct) {
            this.sequencesMade++;
            if (!correct) {
                this.wrongSequences++;
            }
        }

        getRate() {
            let minElapsed = Math.ceil(this.secondsElapsed / 60);
            return Math.round(this.sequencesMade / minElapsed);
        }

        getAccuracy() {
            return Math.round((this.sequencesMade - this.wrongSequences) / this.sequencesMade);
        }

        getScore() {
            return this.sequencesMade;
        }
    }

    class Nucleotide {
        /**
         * 
         * @param {Object} game The game object
         * @param {String} rep The representation of the nucleotide. Choose from A, T
         * @param {String} type The type of the nucleotide. Choose from basic, hbonds, backbone
         */
        constructor (game, rep, type) {
            this.allNucleotides = {
                "A": {
                    shortname: "adenine",
                    color: 0xf49232,
                    matches: ["T"],
                },
                "T": {
                    shortname: "thymine",
                    color: 0x31ace0,
                    matches: ["A"],
                }
            }

            this.game = game;
            this.rep = rep;
            this.type = type;
            this.imgObj = null;
            this.squareObj = null;
            this.display = "rectangle"; // rectangle or nucleotide
            this.matches = this.allNucleotides[rep].matches;
        }

        getObject() {
            if (this.imgObj === null) {
                this.imgObj = this.game.add.image(0, 0, "nt_" + this.getShortName() + "_" + this.type);
                this.squareObj = this.game.add.rectangle(0, 0, 10, 10, this.getColor());
                this.imgObj.setVisible(false);
                this.squareObj.setVisible(false);
                this.imgObj.setData("nucleotide", this);
                this.squareObj.setData("nucleotide", this);
            }
            if (this.display == "rectangle") {
                return this.squareObj;
            } else {
                return this.imgObj;
            }
        }

        setDisplay(type) {
            if (["rectangle", "nucleotide"].indexOf(type) < 0) {
                throw new Error("Invalid display type! " + type);
            }
            if (this.squareObj === null || this.imgObj === null) {
                this.getObject();
            }
            if (this.display == type) {
                return this.getObject();
            }
            this.display = type;
            if (type == "rectangle") { // want squareObj
                this.squareObj.setVisible(this.imgObj.visible);
                this.squareObj.setPosition(this.imgObj.x, this.imgObj.y);
                this.imgObj.setVisible(false);
            } else { // want imgObj
                this.imgObj.setVisible(this.squareObj.visible);
                this.imgObj.setPosition(this.squareObj.x, this.squareObj.y);
                this.squareObj.setVisible(false);
            }
        }

        setVisible(visible) {
            this.getObject().setVisible(visible);
        }

        setPosition(x, y) {
            this.getObject().setPosition(x, y);
        }

        getShortName() {
            return this.allNucleotides[this.rep].shortname;
        }

        getColor() {
            return this.allNucleotides[this.rep].color;
        }

        validMatchWith(other) {
            if (!other) {
                return false;
            }
            return this.allNucleotides[this.rep].matches.indexOf(other.rep) >= 0;
        }

        clone() {
            return new Nucleotide(this.game, this.rep, this.type);
        }

        destroy() {
            this.imgObj.destroy();
            this.squareObj.destroy();
        }
    }

    window.game = new Game([
        { 
            // "ntSequence": "ATATTTTAAATATATATATATAATTATATATATATATA"
            "ntSequence": "ATATTTTAAATATATATATATAATTATATATATATATAAATATATTATATAATATATATTATAAATATATATTTATATATATAATATAAATATATT"
        }
    ]);
})();