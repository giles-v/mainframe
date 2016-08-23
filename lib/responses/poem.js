var ConsoleResponse = require('../consoleresponse.js');

class Poem extends ConsoleResponse {
    getInputExpr() {
        return '^poem$';
    }
    getResponse(s) {
        return "The cat\nSat on\nThe Mat.";
    }
}

module.exports = Poem;