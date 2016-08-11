class ConsoleApp {
    constructor() {
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
    output(s, validOpts) {
        this.emit('consoleapp:output', { 's': s });
    }
    validateInput(s) {
        return true;
    }
}

module.exports = ConsoleApp;