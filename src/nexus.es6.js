class Nexus {
    constructor() {
        console.log("Nexus server!");
        var express = require('express');
        this.fallbackPort = 3000;
        this.app = express();
        this.app.set('port', process.env.PORT || this.fallbackPort);
        this.app.listen(this.app.get('port'), this.appListening.bind(this));
        this.app.use(express.static(__dirname + '/public'));
        this.app.use(function(req, res, next){
            res.locals.showTests = (this.app.get('env') !== 'production' &&
                    req.query.test === '1');
            next();
        }.bind(this));
        this.setupRoutes();
        this.setupTemplates();        
    }

    setupRoutes() {
        this.app.get('/', this.handleIndex.bind(this));
        this.app.get('/tours/hood-river', function(req, res){
            res.render('tours/hood-river'); 
        });
        this.app.get('/tours/request-group-rate', function(req, res){
            res.render('tours/request-group-rate');
        });
    }

    setupTemplates() {
        this.handlebars = require('express3-handlebars')
            .create({ defaultLayout:'main' });
        this.app.engine('handlebars', this.handlebars.engine);
        this.app.set('view engine', 'handlebars');
    }

    handleIndex(req, res) {
        this.greetings = require('./lib/greetings.js');
        res.render('home', { greeting: this.greetings.greeting() });
    }

    getFoo(req, res) {
        res.type('text/plain');
        res.send('Bar');
    }

    setFoo(req, res) {
        res.type('text/plain');
        res.status(404)
        res.send('Not implemented yet');
    }

    appListening() {
        console.log('Express running on port', this.app.get('port'));
    }
}

class NexusController {
    constructor(request, response, args) {
        this.req = request;
        this.res = response;
        this.args = args;
    }
    sendHeader() {
        this.res.writeHead(200, { 'Content-Type': 'text/plain' });
    }
    send() {
        this.sendHeader();
        this.res.end('Hello world!');
    }
}

var server = new Nexus();
