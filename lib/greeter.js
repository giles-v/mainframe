var ConsoleResponse = require('./consoleresponse.js');

class Greeter extends ConsoleResponse {
    constructor() {
        super();
        this.responses = [
            'Word.',
            'It\'s just amazing to make your acquaintance.'
        ];
    }
    getResponse(s) {
        var idx = Math.floor(this.responses.length * Math.random());
        return this.responses[idx];
    }
}

module.exports = Greeter;