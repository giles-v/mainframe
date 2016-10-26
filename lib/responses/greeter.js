var ConsoleResponse = require('../consoleresponse.js');

class Greeter extends ConsoleResponse {
    constructor(db) {
        super(db);
        this.responses = [
            'Word.',
            'It\'s just amazing to make your acquaintance.'
        ];
    }
    isEnabled() {
        return false;
    }
    getInputExpr() {
        return '^(hello|hi|hiya|yo)\\s*$';
    }
    getResponse(s) {
        var idx = Math.floor(this.responses.length * Math.random());
        return this.responses[idx];
    }
}

module.exports = Greeter;