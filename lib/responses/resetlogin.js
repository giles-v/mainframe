var ConsoleResponse = require('../consoleresponse.js');

class ResetLogin extends ConsoleResponse {
    constructor(db) {
        super(db);
    }
    getInputExpr() {
        return '^resetlogin$';
    }
    getResponse(s) {
        this.options = this.db.get('options');
        this.options.findOneAndUpdate({ 'has_logged_in': true }, { 'has_logged_in': false }).then(function(result) {
                console.log("Login reset result:", result);
            });
        this.emit('globallogout');
        return 'Resetting login auth. Please refresh the browser.';
    }
}

module.exports = ResetLogin;