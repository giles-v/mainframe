'use strict';

require('./public/vendor/telegraph.js');

class TerminalServer {
    constructor() {
        console.log("Terminal server starting...");
        var express = require('express');
        this.fallbackPort = 3000;
        this.app = express();
        this.cmds = {};
        this.consoleApp = null;
        this.responses = {};
        this.app.set('port', process.env.PORT || this.fallbackPort);
        this.app.listen(this.app.get('port'), this.appListening.bind(this));

        var bodyParser = require('body-parser')
        this.app.use(bodyParser.json());

        this.app.use(express.static(__dirname + '/public'));
        this.app.use(function(req, res, next){
            res.locals.showTests = (this.app.get('env') !== 'production' &&
                    req.query.test === '1');
            next();
        }.bind(this));
        this.app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            console.log("ERROR", err);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
        this.db = require('monk')('localhost/nexus');
        
        this.setupRoutes();
        this.setupTemplates();
    }

    setupRoutes() {
        this.app.get('/', this.handleIndex.bind(this));
        this.app.get('/checklogin', this.checkLogin.bind(this));
        this.app.post('/cmd', this.postCmd.bind(this));
    }

    setupTemplates() {
        this.handlebars = require('express3-handlebars')
            .create({ defaultLayout:'main' });
        this.app.engine('handlebars', this.handlebars.engine);
        this.app.set('view engine', 'handlebars');
    }

    checkLogin(req, res) {
        this.options = this.db.get('options');
        this.options.count({ 'has_logged_in': true }).then(function(result) {
            res.type('application/json');
            res.send(JSON.stringify({ 'has_logged_in': result > 0 }));
        });
    }

    registerCommand(inputStr, className) {
        this.cmds[inputStr] = className;
    }

    registerResponder(inputExpr, className) {
        this.responses[inputExpr] = className;
    }

    postCmd(req, res) {
        res.type('application/json');
        var respJson = { 'msg': 'Unknown Command' };
        var cmd = req.body.cmd;

        if (this.consoleApp) {
            respJson.msg = this.consoleApp.getResponse(cmd);
        }
        else {
            var newApp = this.findApp(cmd);
            if (newApp) {
                respJson.msg = this.launchApp(newApp);
            }
            else {
                var response = this.getResponder(cmd)
                if (response) {
                    respJson.msg = response;
                }
            }
        }

        res.send(JSON.stringify(respJson));
    }

    findApp(s) {
        if (s in this.cmds) {
            return this.cmds[s];
        }
        return false;
    }

    launchApp(className) {
        this.consoleApp = new className();
        this.consoleApp.on(
            'consoleapp:end', 
            this.onAppComplete.bind(this)
        );
        return this.consoleApp.begin();
    }

    onAppComplete(e) {
        this.consoleApp = null;
    }

    getResponder(s) {
        for(var i in this.responses) {
            var r = new RegExp(i, 'i');
            if (s.match(r)) {
                var response = new this.responses[i]();
                return response.getResponse(s);
            }
        }
        return false;
    }

    handleIndex(req, res) {
        this.greetings = require('./lib/greetings.js');
        res.render('home', { greeting: this.greetings.greeting() });
    }

    appListening() {
        console.log('Express running on port', this.app.get('port'));
    }
}

var server = new TerminalServer();

var GuessOrDeath = require('./lib/guessordeath.js');
server.registerCommand('god', GuessOrDeath);

var Greeter = require('./lib/greeter.js');
server.registerResponder('(hello|hi|hiya|yo)', Greeter);