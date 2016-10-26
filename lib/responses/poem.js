var ConsoleResponse = require('../consoleresponse.js');

class Poem extends ConsoleResponse {
    getInputExpr() {
        return '^poem$';
    }
    isEnabled() {
        return false;
    }
    getResponse(s) {
        return "The cat\nSat on\nThe Mat.";
    }
}

module.exports = Poem;