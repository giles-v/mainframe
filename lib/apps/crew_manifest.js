var ConsoleApp = require('../consoleapp.js');

class CrewManifest extends ConsoleApp {
    constructor(db) {
        super(db);
        this.state = 'init';
        this.guesses = this.maxGuesses = 10;
        this.answer = null;
        this.gamesPlayed = 0;
        this.maxInput = 100;
    }
    isEnabled() {
        return true;
    }
    getInputExpr() {
        return '2';
    }
    getName() {
        return 'Crew Manifest';
    }
    begin() {
        super.begin();
        this.state = 'init';
        this.guesses = 0;
        this.answer = Math.ceil(100 * Math.random());
        return this.output(
            "GUESS OR DEATH\n==============\n1. PLAY!\n2. I SUBMIT", 
            2
        );
    }
    end() {
        super.end();
    }
    output(s, max) {
        super.output(s);
        if (max) this.maxInput = max;
    }
    processCommand(cmd) {
        if (!this.validateInput(cmd)) {
            return this.output("YOUR INVALID COMMAND WEAKENS ME");
        }
        return this.onInput(cmd);
    }
    validateInput(s) {
        if (!super.validateInput(s)) return false;

        var s = parseInt(s, 10);
        if (isNaN(s)) return false;
        if (s < 1 || s > this.maxInput) return false;

        return true;
    }
    onInput(s) {
        s = parseInt(s, 10);
        switch (this.state) {
            case 'play':
                this.guesses++;
                if (s > this.answer) this.output("LESS YOU FOOL", 100);
                if (s < this.answer) this.output("MORE YOU CRETIN", 100);
                if (s === this.answer) {
                    this.output('FATE HAS SMILED ON THE UNWORTHY\nGO FREE FROM MY DOMAIN');
                    this.begin();
                }
                if (this.guesses >= this.maxGuesses) { 
                    this.output('TIME OUT MORTAL\nYOUR SOUL IS MINE');
                    this.begin();
                }
                break;
                
            default:
                if (s === 2) {
                    if (this.gamesPlayed===0) {
                        this.output("THEN ROAST IN THE HELLFIRES OF DAMNATION!");   
                    }
                    this.output('YOU MAY LEAVE NOW BUT YOU WILL BE COMPELLED TO RETURN');
                    this.end();
                    break;
                }
                if (s === 1) {
                    this.gamesPlayed++;
                    this.state = 'play';
                    this.output("ENTER NUMBER (1-100)", 100);
                }
                break;
        }
    }
}

module.exports = CrewManifest;
