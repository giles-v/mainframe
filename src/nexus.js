'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Nexus = (function () {
    function Nexus() {
        _classCallCheck(this, Nexus);

        console.log("Nexus server!");
        var express = require('express');
        this.fallbackPort = 3000;
        this.app = express();
        this.app.set('port', process.env.PORT || this.fallbackPort);
        this.app.listen(this.app.get('port'), this.appListening.bind(this));
        this.app.use(express['static'](__dirname + '/public'));
        this.app.use((function (req, res, next) {
            res.locals.showTests = this.app.get('env') !== 'production' && req.query.test === '1';
            next();
        }).bind(this));
        this.setupRoutes();
        this.setupTemplates();
    }

    _createClass(Nexus, [{
        key: 'setupRoutes',
        value: function setupRoutes() {
            this.app.get('/', this.handleIndex.bind(this));
            this.app.get('/tours/hood-river', function (req, res) {
                res.render('tours/hood-river');
            });
            this.app.get('/tours/request-group-rate', function (req, res) {
                res.render('tours/request-group-rate');
            });
        }
    }, {
        key: 'setupTemplates',
        value: function setupTemplates() {
            this.handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
            this.app.engine('handlebars', this.handlebars.engine);
            this.app.set('view engine', 'handlebars');
        }
    }, {
        key: 'handleIndex',
        value: function handleIndex(req, res) {
            this.greetings = require('./lib/greetings.js');
            res.render('home', { greeting: this.greetings.greeting() });
        }
    }, {
        key: 'getFoo',
        value: function getFoo(req, res) {
            res.type('text/plain');
            res.send('Bar');
        }
    }, {
        key: 'setFoo',
        value: function setFoo(req, res) {
            res.type('text/plain');
            res.status(404);
            res.send('Not implemented yet');
        }
    }, {
        key: 'appListening',
        value: function appListening() {
            console.log('Express running on port', this.app.get('port'));
        }
    }]);

    return Nexus;
})();

var NexusController = (function () {
    function NexusController(request, response, args) {
        _classCallCheck(this, NexusController);

        this.req = request;
        this.res = response;
        this.args = args;
    }

    _createClass(NexusController, [{
        key: 'sendHeader',
        value: function sendHeader() {
            this.res.writeHead(200, { 'Content-Type': 'text/plain' });
        }
    }, {
        key: 'send',
        value: function send() {
            this.sendHeader();
            this.res.end('Hello world!');
        }
    }]);

    return NexusController;
})();

var server = new Nexus();
