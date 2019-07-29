import GameScore from "../gamescore.js";
import PopupManager from "../popupmanager.js";
import Nucleotide from "../nucleotide.js";
import PositionManager from "../positionmanager.js";
import LevelComplete from "./levelcomplete.js";

class LevelStage extends Phaser.Scene {
    constructor (config) {
        super(config);
    }

    init(data) {
        this.levelConfig = data.level;
        this.gameObj = data.gameObj;
        this.game = this;
        this.level = data.lvlNum;
        this.rotateNT = this.levelConfig.rotateNT;
        this.ntType = this.levelConfig.ntType;
        this.gameEnded = false;
        this.scorekeeping = null;
        this.objects = {};
        this.nucleotides = [];
        this.ntButtons = [];
        this.btnLocations = {
            0: [310, 340],
            1: [310, 440],
            2: [310, 540],
            3: [310, 640]
        }
        this.ntBtnsEnabled = true;
        this.scorekeeping = new GameScore(this.game);
        this.popupmanager = new PopupManager(this);

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

        this.ntHighlightEllipse = this.game.add.ellipse(140, 510, 230, 125, 0xfffaa8, 1);
        this.ntHighlightEllipse.setAngle(16);
        this.ntHighlightEllipse.setAlpha(0.90);

        this.game.add.text(70, 554, "Binding Pocket", 
            {fontFamily: '\'Open Sans\', sans-serif', fontSize: '9pt', color: '#000'}).setAngle(19).setAlpha(0.5);

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

        this.game.add.text(257, 497, "5'", 
            {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});

        this.game.add.text(340, 690, "3'", 
            {fontFamily: '\'Open Sans\', sans-serif', fontSize: '8pt', color: '#000'});
        
        let ntParticleConfig = {
            x: 150,
            y: 510,
            speed: { min: -800, max: 800 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            active: false,
            lifespan: 600,
            gravityY: 800
        };
        this.ntparticle = {
            "adenine": this.add.particles("ntparticle_adenine").createEmitter(ntParticleConfig),
            "cytosine": this.add.particles("ntparticle_cytosine").createEmitter(ntParticleConfig),
            "guanine": this.add.particles("ntparticle_guanine").createEmitter(ntParticleConfig),
            "thymine": this.add.particles("ntparticle_thymine").createEmitter(ntParticleConfig),
        }

        for (let i = 0; i < Object.keys(this.ntparticle).length; i++) {
            let nt = Object.keys(this.ntparticle)[i];
            this.ntparticle[nt].manager.setDepth(5000);
        }

        let nucleotides = this.gameObj.levels[this.level].ntSequence;
        for (let i = 0; i < nucleotides.length; i++) {
            let nucleotide = new Nucleotide(this, nucleotides[i], this.ntType);
            this.nucleotides.push(nucleotide);
        }

        this.positionManager = new PositionManager(this, this.levelConfig.speed);
        this.positionManager.setPositions(false);

        let optbtns = this.gameObj.levels[this.level].controls;
        if (!optbtns) {
            optbtns = ["T", "A", "G", "C"];
        }
        for (let i = 0; i < optbtns.length; i++) {
            this.makeNTBtn(optbtns[i]);
        }
        this.shuffleNTBtnAngle();

        this.scene.remove("levelcomplete" + this.level);

        this.scorekeeping.init();

        let that = this;
        this.time.addEvent({
            delay: 5000,
            loop: false,
            callback: function () {
                that.scorekeeping.start();

                that.positionManager.start();
            }
        });
    }

    bindFn(fn) {
        let clas = this;
        return function (...args) {
            let event = this;
            fn.bind(clas, event, ...args)();
        };
    }

    makeNTBtn(type) {
        let nt = new Nucleotide(this, type, this.ntType);
        nt.setDisplay("nucleotide");
        nt.setVisible(true);
        nt.setPosition(this.btnLocations[this.ntButtons.length][0], this.btnLocations[this.ntButtons.length][1]);
        nt.setScale(0.20);
        nt.getObject().setInteractive();
        nt.showLetter(true);
        this.game.input.setDraggable(nt.getObject());
        this.game.input.on("dragstart", this.bindFn(this.onDragNTBtnStart));
        this.game.input.on("drag", this.bindFn(this.onDragNTBtn));
        this.game.input.on("dragend", this.bindFn(this.onDragNTBtnEnd));
        this.ntButtons.push(nt);
    }

    shuffleNTBtnAngle() {
        if (!this.rotateNT) {
            return;
        }
        let angles = [0, 90, 180, 270];
        for (let i = 0; i < this.ntButtons.length; i++) {
            let angle = angles[Math.floor(Math.random()*angles.length)];
            this.ntButtons[i].setAngle(angle);
        }
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
        let angle = image.getData("nucleotide").getAngle();
        image.setData("pointerStartX", x);
        image.setData("pointerStartY", y);
        // image.setData("startAngle", angle);
        image.setData("startedDragging", true);
        image.setData("distanceDragged", 0);
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
        image.setData("distanceDragged", distance);
    }

    onDragNTBtnEnd (input, pointer, image) {
        let startedDragging = image.getData("startedDragging");
        if (!startedDragging) {
            return;
        }
        if (!this.ntBtnsEnabled) {
            return;
        }
        let distance = image.getData("distanceDragged");
        if (distance < 15 && this.rotateNT) {
            let nt = image.getData("nucleotide");
            nt.setAngle(nt.getAngle() + 90);
        } else if (this.positionManager.ntTouchingBindingPocket()){
            let angle = image.angle;
            let clickedNT = image.getData("nucleotide");
            let headNT = this.positionManager.getHeadNucleotide();
            let cloned = clickedNT.clone();
            cloned.setDisplay("nucleotide");
            cloned.setPosition(clickedNT.getObject().x, clickedNT.getObject().y);
            cloned.setVisible(true);
            cloned.setScale(0.18);
            cloned.setAngle(clickedNT.getAngle());
            this.shuffleNTBtnAngle();
            this.ntBtnsEnabled = false;
            if (!clickedNT.validMatchWith(headNT) || (this.rotateNT && cloned.getAngle() % 180 != 0)) {
                let correctnt = this.positionManager.getValidMatchNT(headNT);
                this.popupmanager.emitEvent("errorMatch", headNT, correctnt);
                this.popupmanager.emitEvent("error5Match", headNT, correctnt);
                cloned.setError(true);
                this.scorekeeping.incrementIncorrectSequences();
            } else {
                this.popupmanager.emitEvent("correctMatch", headNT, cloned);
                this.popupmanager.emitEvent("firstCorrectMatch", headNT, cloned);
                this.scorekeeping.incrementSequencesMade();
                let headNTName = headNT.getShortName();
                let pairNTName = cloned.getShortName();
                let that = this;
                this.game.time.addEvent({
                    delay: 100,
                    loop: false,
                    callback: function () {
                        that.ntparticle[headNTName].resume();
                        that.ntparticle[headNTName].explode(50);
                        that.game.time.addEvent({
                            delay: 100,
                            callback: function () {
                                that.ntparticle[pairNTName].resume();
                                that.ntparticle[pairNTName].explode(50);
                            },
                            loop: false
                        });
                    }
                });
            }
            this.positionManager.addToDNAOutput(cloned);
            image.getData("nucleotide").setAngle(0);
        }
        image.setData("startedDragging", false);
    }

    endGame() {
        if (this.gameEnded) {
            return;
        }
        this.gameEnded = true;
        let sceneName = "levelcomplete" + this.level;
        let levelSceneName = "level" + this.level;
        let nucleotides = this.positionManager.selectedNucleotides.filter(function (el) {
            return el != null;
        });
        this.scene.add(sceneName, LevelComplete, false, {level: this.level, gameObj: this.gameObj, nucleotides: nucleotides, score: this.scorekeeping.getScore(), accuracy: this.scorekeeping.getAccuracy()});
        let that = this;
        this.time.addEvent({
            delay: 300,
            loop: false,
            callback: function () {
                that.scene.launch(sceneName);
                that.scene.pause();
                that.scene.moveAbove(levelSceneName, sceneName);
                that.popupmanager.destroy();
            }
        });
    }
}

export default LevelStage;
