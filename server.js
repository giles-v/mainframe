#!/usr/bin/env node

'use strict';

require('./public/vendor/telegraph.js');

class TerminalServer {
    constructor() {
        console.log("Terminal server starting...");
        var express = require('express');
        this.app = express();

        var http = require('http').Server(this.app);
        this.io = require('socket.io')(http);

        this.cmds = {};
        this.responses = {};
        this.sessions = {};

        http.listen(3000, this.appListening.bind(this)); 

        var bodyParser = require('body-parser')
        this.app.use(bodyParser.json());

        this.app.use(express.static(__dirname + '/public'));
        this.app.use((req, res, next) => {
            res.locals.showTests = (this.app.get('env') !== 'production' &&
                    req.query.test === '1');
            next();
        });
        this.app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            console.log("ERROR", err);
        });

        this.setupSocketComms();
        this.setupRoutes();
        this.setupTemplates();
    }

    setupRoutes() {
        this.app.get('/', (req, res) => {
            this.bootlines = require('./lib/bootlines.js');
            res.render('home', { bootlines: this.bootlines.get() });
        });
    }

    setupTemplates() {
        this.handlebars = require('express3-handlebars')
            .create({ defaultLayout:'main' });
        this.app.engine('handlebars', this.handlebars.engine);
        this.app.set('view engine', 'handlebars');
    }

    setupSocketComms() {
        this.io.on('connection', this.onClientConnected.bind(this));
    }

    onClientConnected(client) {
        console.log('User', client.id, 'connected.');
        this.sessions[client.id] = {
            currentApp: null,
            lastCmd: null
        };
        client.on('disconnect', () => {
            console.log('User '+client.id+' disconnected.');
            delete this.sessions[client.id];
        });
        client.on('login', () => {
            console.log("Client "+client.id+" sent LOGIN");
            this.allowSocketInputFor(client);
        });
    }

    allowSocketInputFor(client) {
        client.emit('begin', this.globalLoginComplete);
    }

    disableSocketInputFor(client) {
        client.emit('end');
    }

    respond(client, msg) {
        console.log('Client', client.id, '- sending response "'+msg+'"');
        client.emit('response', msg);
    }

    appListening() {
        console.log('Express running on port 3000');
    }
}

var server = new TerminalServer();
