var ConsoleApp = require('./consoleapp.js');

class GuessOrDeath extends ConsoleApp {
    constructor() {
        super();
        this.state = 'init';
        this.guesses = this.maxGuesses = 10;
        this.answer = null;
        this.gamesPlayed = 0;
        this.maxInput = 100;
    }
    begin() {
        super.begin();
        return this.output(
            "GUESS OR DEATH\n==============\n1. PLAY!\n2. I SUBMIT", 
            2
        );
    }
    end() {
        super.end();
    }
    output(s, max) {
        if (max) this.maxInput = max;
        return s;
    }
    getResponse(cmd) {
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
                if (s == this.answer) {
                    this.state = 'end';
                    return this.output("FATE HAS SMILED ON THE UNWORTHY\nGO FREE FROM MY DOMAIN");
                    break;
                }
                if (this.guesses >= this.maxGuesses) { 
                    this.state = 'end';
                    return this.output("TIME OUT MORTAL\nYOUR SOUL IS MINE");
                    break;
                }
                break;

            case 'end':
                this.begin();
                break;
                
            default:
                if (s === 2) {
                    this.end();
                    if (this.gamesPlayed==0) {
                        return this.output("THEN ROAST IN THE HELLFIRES OF DAMNATION!\nYOU MAY LEAVE NOW BUT YOU WILL BE COMPELLED TO RETURN");
                    }
                    else {
                        return this.output("YOU MAY LEAVE NOW BUT YOU WILL BE COMPELLED TO RETURN ");
                    }
                    break;
                }
                if (s === 1) {
                    this.state = 'play';
                    this.guesses = 0;
                    this.answer = Math.ceil(100 * Math.random());
                    return this.output("ENTER NUMBER (1-100)", 100);
                }
                break;
        }
    }
}

module.exports = GuessOrDeath;
