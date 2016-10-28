var ConsoleApp = require('../consoleapp.js');

class CommsArray extends ConsoleApp {
    constructor(db, client, globalState) {
        super(db);
        this.client = client;
        this.globalState = globalState;
    }
    isEnabled() {
        return true;
    }
    isChat() {
        return true;
    }
    getInputExpr() {
        return '1';
    }
    getName() {
        return 'Comms Array';
    }
    begin() {
        super.begin();
        var users = this.server.getOtherUsernamesForApp(this.constructor.name, this.client);
        this.output("Joining comms. "+this.formatOtherUsers(users)+"\nUseful commands are QUIT and USERS.");
        if (!('msgs' in this.globalState)) {
            this.globalState.msgs = [];
        }
        this.globalState.msgs.forEach(msg => {
            this.printMsg(msg);
        });
    }
    formatOtherUsers(users) {
        if (users.length === 0) {
            return "There are no other users in this channel.";
        }
        if (users.length === 1) {
            return "Other users in this channel: " + users.pop() + ".";
        }
        var last = users.pop();
        return users.join(", ") + " and " + last;
    }
    formatTime(time) {
        var d = new Date(time);
        return this.leftPad(d.getHours()) + ':' + 
               this.leftPad(d.getMinutes()) + ':' + 
               this.leftPad(d.getSeconds());
    }
    leftPad(s) {
        if (s < 10) return '0' + String(s);
        return String(s);
    }
    formatMsg(msg) {
        return '[' + this.formatTime(msg.time) + '] ' + msg.user + ': ' + msg.text;
    }
    printMsg(msg) {
        this.output(this.formatMsg(msg));
    }
    end() {
        super.end();
    }
    processCommand(cmd) {
        var c = cmd.toLowerCase();
        if (c==='quit') {
            this.output('Leaving comms array.');
            this.end();
            return;
        }
        if (c==='users') {
            var users = this.server.getOtherUsernamesForApp(this.constructor.name, this.client);
            console.log(users);
            if (users.length === 0) {
                this.output('You are alone.');
            }
            else {
                this.output(this.formatOtherUsers(users));
            }
            return;
        }
        var msg = {
            user: this.client.session.user.displayName,
            time: Date.now(),
            text: cmd
        };
        this.globalState.msgs.push(msg);
        this.appBroadcast(this.formatMsg(msg));
    }
}

module.exports = CommsArray;
