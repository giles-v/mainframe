class ConsoleResponse {
    constructor(db) {
        telegraph(this);
        this.db = db;
    }
    getInputExpr() {
        return '(foo|bar)';
    }
    getResponse(s) {
        return 'What do you mean, '+s+'?';
    }
}

module.exports = ConsoleResponse;