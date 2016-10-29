var ConsoleApp = require('../consoleapp.js');

class Login extends ConsoleApp {
    constructor(db) {
        super(db);
        this.db = db;
        this.state = 'user';
        this.user = false;
    }
    isEnabled() {
        return false;
    }
    getInputExpr() {
        return '1';
    }
    begin() {
        super.begin();
        this.state = 'user';
        return this.output('Please self-identify.');
    }
    processCommand(cmd) {
        try {
            this.logins = this.db.getOptsFromFile('logins', true);
            switch (this.state) {
                case 'user':
                    this.user = this.logins[cmd];
                    if (this.user) {
                        this.user.name = cmd;
                        this.state = 'pass';
                        return this.output('Hello "'+this.user.name+'". Enter your security code.');
                    }
                    else {
                        return this.output('Unknown entity. Please self-identify.')
                    }
                break;
                case 'pass':
                    if (cmd === this.user.password) {
                        this.output('Welcome back, '+this.user.displayName+'.')
                        this.emit('login:success', this.user);
                        return;
                    }
                    else {
                        this.user = false;
                        this.state = 'user';
                        return this.output('Checksum mismatch // security clearance denied. Please self-identify.');
                    }
                break;
            }
            this.output('State error');
            this.end();
        }
        catch (e) {
            this.output('Authorization table corrupt - input not processed');
        }
    }
}

module.exports = Login;
