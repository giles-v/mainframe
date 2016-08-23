class ConsoleApp {
    constructor(db) {
        telegraph(this);
    }
    begin() {
        // begin must return the first response, launch message
        // or similar.
        return 'Launching app...';
    }
    end() {
        this.emit('consoleapp:end');
    }
    getInputExpr() {
        return 'runapp';
    }
    processCommand(s) {
        'processCommand() not implemented for this app.';
    }
    output(s) {
        this.emit('consoleapp:output', { 's': s });
    }
    validateInput(s) {
        return true;
    }
}

module.exports = ConsoleApp;