class ConsoleApp {
    constructor(db) {
        telegraph(this);
    }
    isChat() {
        return false;
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
        this.emit('consoleapp:output', { className: this.constructor.name.toLowerCase(), s: s });
    }
    appBroadcast(data) {
        this.emit('consoleapp:appbroadcast', { app: this.constructor.name, s: data });
    }
    validateInput(s) {
        return true;
    }
}

module.exports = ConsoleApp;