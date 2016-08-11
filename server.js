class TerminalServer {
    constructor() {
        console.log("Terminal server starting...");
        var express = require('express');
        this.fallbackPort = 3000;
        this.app = express();
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

    postCmd(req, res) {
        res.type('application/json');
        var respJson = { 'msg': 'Whatnow?' };
        if (req.body.cmd === 'hello') {
            respJson.msg = 'Hiya!';
        }
        res.send(JSON.stringify(respJson));
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
