/**
 * Class representing a single nucleotide. Wraps on a few Phaser objects.
 */
class Nucleotide {
    /**
     * Creates the nucleotide object.
     * 
     * @param {LevelStage} level The level object
     * @param {String} rep The representation of the nucleotide. Choose from A, T
     * @param {String} type The type of the nucleotide. Choose from basic, hbonds, backbone
     */
    constructor (level, rep, type) {
        this.allNucleotides = {
            "A": {
                shortname: "adenine",
                color: 0xf49232,
                matches: ["T"],
                classification: "purine",
                display: {
                    "basic": {
                        "origin": [0.5, 0.5],
                        "angle": 0,
                    },
                    "hbonds": {
                        "origin": [0.42, 0.5],
                        "angle": 0,
                    },
                }
            },
            "T": {
                shortname: "thymine",
                color: 0x31ace0,
                matches: ["A"],
                classification: "pyrimidine",
                display: {
                    "basic": {
                        "origin": [0.5, 0.5],
                        "angle": 0,
                    },
                    "hbonds": {
                        "origin": [0.65, 0.65],
                        "angle": 180,
                    },
                }
            },
            "C": {
                shortname: "cytosine",
                color: 0xc71489,
                matches: ["G"],
                classification: "pyrimidine",
                display: {
                    "basic": {
                        "origin": [0.5, 0.5],
                        "angle": 0,
                    },
                    "hbonds": {
                        "origin": [0.65, 0.5],
                        "angle": 180,
                    },
                }
            },
            "G": {
                shortname: "guanine",
                color: 0x26b11e,
                matches: ["C"],
                classification: "purine",
                display: {
                    "basic": {
                        "origin": [0.5, 0.5],
                        "angle": 0,
                    },
                    "hbonds": {
                        "origin": [0.5, 0.40],
                        "angle": 0,
                    },
                }
            },
        }

        this.level = level;
        this.rep = rep;
        this.type = type;
        this.imgObj = null;
        this.squareObj = null;
        this.display = "rectangle"; // rectangle or nucleotide
        this.matches = this.allNucleotides[rep].matches;
        this.displayment = this.allNucleotides[rep].display[type];
        this.errorNT = false; // is an error NT and should show red BG
        this.missingNT = false; // is missing NT and should show a white center
        this.dispLetter = false; // should display NT letter on the face
    }

    /**
     * Returns the actual Phaser object that this class wraps depending on the display mode.
     * Gives a square object if display is rectangle or image object if display is nucleotide.
     * @returns {Phaser.GameObjects.Rectangle|Phaser.GameObjects.Image} the current object
     */
    getObject() {
        if (this.imgObj === null) {
            this._genNTObjs();
        }
        if (this.display == "rectangle") {
            return this.squareObj;
        } else {
            return this.imgObj;
        }
    }

    /**
     * Generates the appropriate image, rectangle, errortides, and missingtides for the class
     * Also includes text representation. All are invisible of course.
     */
    _genNTObjs() {
        this.imgObj = this.level.add.image(0, 0, "nt_" + this.getShortName() + "_" + this.type);
        this.squareObj = this.level.add.rectangle(0, 0, 10, 10, this.getColor());
        this.imgObj.setVisible(false);
        this.squareObj.setVisible(false);
        this.imgObj.setData("nucleotide", this);
        this.squareObj.setData("nucleotide", this);
        this.imgObj.setDepth(1);
        this.squareObj.setDepth(1);

        this.imgObj.setOrigin(this.displayment.origin[0], this.displayment.origin[1]);
        this.imgObj.setAngle(this.displayment.angle);
        
        this.imgObjErr = this.level.add.image(0, 0, "errortide_" + this.getClassification());
        this.squareObjErr = this.level.add.rectangle(0, 0, 15, 15, 0xfc0e33);
        this.imgObjErr.setVisible(false);
        this.squareObjErr.setVisible(false);
        this.imgObjErr.setDepth(0);
        this.squareObjErr.setDepth(0);

        this.imgObjMiss = this.level.add.image(0, 0, "missingtide_" + this.getClassification());
        this.squareObjMiss = this.level.add.rectangle(0, 0, 15, 15, 0xffffff);
        this.imgObjMiss.setVisible(false);
        this.squareObjMiss.setVisible(false);
        this.imgObjMiss.setDepth(2);
        this.squareObjMiss.setDepth(2);

        this.letterText = this.level.add.text(0, 0, this.rep, 
            {fontFamily: '\'Open Sans\', sans-serif', fontSize: '18pt', color: '#fff'}).setOrigin(0.5);
        this.letterText.setDepth(3);
        this.letterText.setVisible(false);
    }

    /**
     * Sets the depth of the nucleotide (z-index)
     * @param {number} depth 
     */
    setDepth(depth) {
        if (!this.imgObj) {
            this.getObject();
        }
        this.imgObj.setDepth(depth);
        this.squareObj.setDepth(depth);
        this.imgObjErr.setDepth(depth - 1);
        this.squareObjErr.setDepth(depth - 1);
        this.imgObjMiss.setDepth(depth + 1);
        this.squareObjMiss.setDepth(depth + 1);
        this.letterText.setDepth(depth + 2);
    }

    /**
     * Changes the nucleotide display between rectangle or nucleotide counterparts.
     * @param {String} type - The type to display. Either "rectangle" or "nucleotide"
     */
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
            this.letterText.setVisible(false);
        } else { // want imgObj
            this.imgObj.setVisible(this.squareObj.visible);
            this.imgObj.setPosition(this.squareObj.x, this.squareObj.y);
            this.squareObj.setVisible(false);
            if (this.dispLetter) {
                this.letterText.setVisible(true);
                this.letterText.setPosition(this.squareObj.x, this.squareObj.y);
            } else {
                this.letterText.setVisible(false);
            }
        }
        this.updateErrorDisplay();
    }

    /**
     * Updates the red error background. Should be invoked on every changes to the main object.
     */
    updateErrorDisplay() {
        if (!this.imgObjErr || !this.squareObjErr) {
            return;
        }
        if (!this.errorNT) {
            this.squareObjErr.setVisible(false);
            this.imgObjErr.setVisible(false);
            return;
        }
        if (this.display == "rectangle") {
            this.squareObjErr.setVisible(this.squareObj.visible);
            this.squareObjErr.setPosition(this.squareObj.x, this.squareObj.y);
            this.imgObjErr.setVisible(false);
            this.squareObjErr.setScale(this.squareObj.scale);
        } else {
            this.imgObjErr.setVisible(this.imgObj.visible);
            this.imgObjErr.setPosition(this.imgObj.x, this.imgObj.y);
            this.squareObjErr.setVisible(false);
            let scale = this.imgObj.scale;
            if (scale > 0) {
                scale = scale + scale * 0.30;
            }
            this.imgObjErr.setScale(scale);
            this.imgObjErr.setAlpha(this.imgObj.alpha);
            this.imgObjErr.setAngle(this.imgObj.angle);
        }
    }

    /**
     * Updates the white background on the nucleotide. Should be called on every change to the NT.
     */
    updateMissingDisplay() {
        if (!this.imgObjMiss || !this.squareObjMiss) {
            return;
        }
        if (!this.missingNT) {
            this.squareObjMiss.setVisible(false);
            this.imgObjMiss.setVisible(false);
            return;
        }
        if (this.display == "rectangle") {
            this.squareObjMiss.setVisible(this.squareObj.visible);
            this.squareObjMiss.setPosition(this.squareObj.x, this.squareObj.y);
            this.imgObjMiss.setVisible(false);
            this.squareObjMiss.setScale(this.squareObj.scale - 0.55);
        } else {
            this.imgObjMiss.setVisible(this.imgObj.visible);
            this.imgObjMiss.setPosition(this.imgObj.x, this.imgObj.y);
            this.squareObjMiss.setVisible(false);
            let scale = this.imgObj.scale;
            if (scale > 0) {
                scale = scale - scale * 0.25;
            }
            this.imgObjMiss.setScale(scale);
            this.imgObjMiss.setAlpha(this.imgObj.alpha);
            this.imgObjMiss.setAngle(this.imgObj.angle);
        }
    }

    /**
     * Updates the letter display on the nucleotide. Only shows when in nucleotide display mode.
     */
    updateLetterDisplay() {
        if (this.dispLetter && this.display != "rectangle") {
            this.letterText.setVisible(true);
            let x = this.getObject().x;
            let y = this.getObject().y;
            if (this.getClassification() == "purine") {
                let p = x;
                let q = y;
                x = x + 13;
                y = y + 9;
                let th = this.getObject().angle;
                th = th * Math.PI / 180;
                let xp = (x - p) * Math.cos(th) - (y - q) * Math.sin(th) + p;
                let yp = (x - p) * Math.sin(th) + (y - q) * Math.cos(th) + q;
                x = xp;
                y = yp;
            }
            this.letterText.setPosition(x, y);
            this.letterText.setDepth(this.imgObj.depth + 2);
        } else {
            this.letterText.setVisible(false);
        }
    }

    /**
     * Sets whether the letter should be shown to the player on top of the nucleotide
     * @param {boolean} shouldShow - Should show letter
     */
    showLetter(shouldShow) {
        this.dispLetter = shouldShow;
        this.updateLetterDisplay();
    }

    /**
     * Sets whether the nucleotide objects should be visible or hidden
     * @param {boolean} visible - visible or hidden
     */
    setVisible(visible) {
        this.getObject().setVisible(visible);
        this.updateErrorDisplay();
        this.updateMissingDisplay();
        this.updateLetterDisplay();
    }

    /**
     * Sets the position of the nucleotide object
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.getObject().setPosition(x, y);
        this.updateErrorDisplay();
        this.updateMissingDisplay();
        this.updateLetterDisplay();
    }

    /**
     * Sets the size of the nucleotide display
     * @param {number} scale - how big the NT should be
     */
    setScale(scale) {
        this.getObject().setScale(scale);
        this.updateErrorDisplay();
        this.updateMissingDisplay();
    }

    /**
     * Returns the angle of the nucleotide object
     * @returns {number} the angle of the nucleotide
     */
    getAngle() {
        return this.getObject().angle - this.displayment.angle;
    }

    /**
     * Sets how much the nucleotide should be rotated
     * @param {number} angle - how much the nucleotide should be rotated in degrees.
     */
    setAngle(angle) {
        angle = angle + this.displayment.angle;
        this.getObject().setAngle(angle);
        this.updateLetterDisplay();
    }

    /**
     * Sets whether the red background shows behind the nucleotide.
     * @param {boolean} errorBool - show red background
     */
    setError(errorBool) {
        this.errorNT = errorBool;
        this.updateErrorDisplay();
    }

    /**
     * Sets whether the white core should be shown on the nucleotide
     * @param {boolean} missingBool - show white center
     */
    setMissing(missingBool) {
        this.missingNT = missingBool;
        this.updateMissingDisplay();
    }

    /**
     * Returns the nucleotide full name in all lowercase
     * @returns {string} nucleotide name
     */
    getShortName() {
        return this.allNucleotides[this.rep].shortname;
    }

    /**
     * Returns the color of the nucleotide
     * @return {number} the color
     */
    getColor() {
        return this.allNucleotides[this.rep].color;
    }

    /**
     * Returns the classification of the nucleotide. purine or pyrimidine
     * @return {string} classification
     */
    getClassification() {
        return this.allNucleotides[this.rep].classification;
    }

    /**
     * Check if the other nucleotide matches with the current according to biology.
     * @param {Nucleotide} other - the other nucleotide to test against
     */
    validMatchWith(other) {
        if (!other) {
            return false;
        }
        return this.allNucleotides[this.rep].matches.indexOf(other.rep) >= 0;
    }

    /**
     * Shortcut for cloning a nucleotide that contains the same level, representation, and type
     * @param {LevelStage} [level=this.level] - the scene that will contain the nucleotide
     * @returns {Nucleotide} the nucleotide with some properties cloned
     */
    clone(level=this.level) {
        return new Nucleotide(level, this.rep, this.type);
    }

    /**
     * Destroys the nucleotide object
     */
    destroy() {
        this.imgObj.destroy();
        this.squareObj.destroy();
    }

    /**
     * Returns a JSON representation of the nucleotide
     * @returns {JSON} the json object of the nt
     */
    toJSON() {
        return {
            "name": this.getShortName().substr(0, 1).toUpperCase() + this.getShortName().substr(1, this.getShortName().length),
            "color": "#" + this.getColor().toString(16),
        }
    }
}

export default Nucleotide;
