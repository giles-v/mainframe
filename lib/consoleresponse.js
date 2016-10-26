class ConsoleResponse {
    constructor(db) {
        telegraph(this);
        this.db = db;
    }
    isChat() {
        return false;
    }
    getInputExpr() {
        return '(foo|bar)';
    }
    getResponse(s) {
        return 'What do you mean, '+s+'?';
    }
}

module.exports = ConsoleResponse;