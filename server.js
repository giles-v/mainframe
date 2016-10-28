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

        // this.db = require('./lib/datastore_mongo')('localhost:27017', 'nexus');
        var dataPath = require("path").join(__dirname, 'data');
        this.db = require('./lib/datastore_json')(dataPath);

        this.cmds = {};
        this.cmd_descriptions = [];
        this.responses = {};
        this.sessions = {};
        this.clients = [];
        this.appsPath = require("path").join(__dirname, 'lib/apps');
        this.appsGlobalState = {};

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
        
        this.loadModules('apps', this.registerApp.bind(this));
        this.loadModules('responses', this.registerResponder.bind(this));
        var ErrorResponse = require('./lib/errorresponse.js');
        this.errorResponse = new ErrorResponse();

        this.setupSocketComms();
        this.setupRoutes();
        this.setupTemplates();
    }

    loadModules(libDir, callback) {
        var dir = 'lib/' + libDir + '/';
        var normalizedPath = require("path").join(__dirname, dir);
        require("fs").readdirSync(normalizedPath).forEach((file) => {
            var module = require("./" + dir + file);
            var instance = new module(this.db);
            console.log("Loading module", instance.constructor.name);
            if (instance.isEnabled()) {
                callback(module, instance);
            }
        });
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
        this.clients.push(client);
        client.on('disconnect', () => {
            console.log('User '+client.id+' disconnected.');
            this.clients = this.clients.filter(c => (c.id !== client.id));
            if ('session' in client && 'currentApp' in client.session) {
                this.onAppEnds(client);
            }
            delete this.sessions[client.id];
        });
        client.on('login', () => {
            console.log("Client "+client.id+" sent LOGIN");
            var session = this.sessions[client.id];
            client.session = session;
            var Login = require(this.appsPath + '/login');
            session.currentApp = new Login(this.db);
            session.currentApp.on('consoleapp:output',  s => this.respond(client, s.s, s.class));
            session.currentApp.on('consoleapp:end',     () => this.onAppEnds(client));
            session.currentApp.on('login:success',      (user) => {
                console.log("LOGIN SUCCESS");
                console.log(user);
                session.loginComplete = true;
                session.user = user;
                this.onAppEnds(client);
            });
            session.currentApp.begin();
            this.allowSocketInputFor(client);
        });
    }

    onAppEnds(client) {
        var session = this.sessions[client.id];
        
        if (session.currentApp.isChat()) {
            this.appBroadcast(session.currentApp.constructor.name, session.user.displayName + ' has left.');
        }

        delete session.currentApp;
        this.respond(client, "Please select an option:\n" + this.cmd_descriptions.join("\n"));
    }

    allowSocketInputFor(client) {
        client.on('command', (cmd) => {
            console.log('User '+client.id+' sent command "'+cmd+'".');
            var session = this.sessions[client.id];
            this.processCommand(client, cmd);
        });
        client.emit('begin', 'Please self-identify');
    }

    disableSocketInputFor(client) {
        client.on('command', function(){});
        client.emit('end');
    }

    processCommand(client, cmd) {
        var responseMsg = 'Unknown Command';
        var session = this.sessions[client.id];
        if (session.currentApp) {
            session.currentApp.processCommand(cmd);
        }
        else {
            var newApp = this.findApp(cmd);
            if (newApp) {
                session.currentApp = new newApp(this.db, client, this.appsGlobalState[cmd]);
                session.currentApp.on('consoleapp:output',       s => this.respond(client, s.s, s.className));
                session.currentApp.on('consoleapp:appbroadcast', s => this.appBroadcast(s.app, s.s));
                session.currentApp.on('consoleapp:end',          () => this.onAppEnds(client));
                session.currentApp.server = this;
                session.currentApp.begin();

                if (session.currentApp.isChat()) {
                    session.currentApp.server = this;
                    this.appBroadcast(session.currentApp.constructor.name, session.user.displayName + ' has joined.');
                }
            }
            else {
                var response = this.getResponder(cmd, this.db);
                if (!response) {
                    response = this.errorResponse.getResponse('');
                }
                this.respond(client, response);
            }
        }
    }

    respond(client, msg, className) {
        console.log('Client', client.id, '- sending response "'+msg+'"');
        client.emit('response', { s:msg, class:className });
    }

    appBroadcast(app, msg) {
        console.log("Broadcasting", msg, "to all users of", app);
        this.getUsersOf(app).forEach(c => {
            console.log("Client", c.id, "is currently using", app, "- sending.");
            this.respond(c, msg, app.toLowerCase());
        });
    }

    getUsersOf(app) {
        return this.clients.filter(
            c => ('session' in c && 'currentApp' in c.session && c.session.currentApp.constructor.name === app)
        );
    }

    getOtherUsernamesForApp(app, exceptClient) {
        var users = this.getUsersOf(app);
        var otherUsers = users.filter(c => (c.id !== exceptClient.id));
        return otherUsers.map(c => (c.session.user.displayName));
    }

    registerApp(module, instance) {
        console.log("Registered app", module.name);
        this.cmd_descriptions.push(instance.getInputExpr() + '. ' + instance.getName());
        this.cmds[instance.getInputExpr()] = module;
        this.appsGlobalState[instance.getInputExpr()] = {};
    }

    registerResponder(inputExpr, className) {
        console.log("Registered responder", className.name);
        this.responses[inputExpr] = className;
    }

    findApp(s) {
        if (s in this.cmds) {
            return this.cmds[s];
        }
        return false;
    }

    getResponder(s, db) {
        for(var i in this.responses) {
            var r = new RegExp(i, 'i');
            if (s.match(r)) {
                var response = new this.responses[i](db);
                return response.getResponse(s);
            }
        }
        return false;
    }

    appListening() {
        console.log('Express running on port 3000');
    }
}

var server = new TerminalServer();
