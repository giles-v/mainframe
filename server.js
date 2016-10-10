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

        this.db = require('monk')('localhost/nexus');

        this.cmds = {};
        this.responses = {};
        this.sessions = {};

        http.listen(3000, this.appListening.bind(this)); 

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
        });
        
        this.loadModules('apps', this.registerApp.bind(this));
        this.loadModules('responses', this.registerResponder.bind(this));
        var ErrorResponse = require('./lib/errorresponse.js');
        this.errorResponse = new ErrorResponse();

        this.setupSocketComms();
        this.setupRoutes();
        this.setupTemplates();

        this.globalLoginComplete = false;
        this.options = this.db.get('options');
        this.options.count({ 'has_logged_in': true }).then(function(result) {
            this.globalLoginComplete = (result > 0);
            console.log("global login state is", this.globalLoginComplete);
        }.bind(this));
    }

    loadModules(libDir, callback) {
        var dir = 'lib/' + libDir + '/';
        var normalizedPath = require("path").join(__dirname, dir);
        require("fs").readdirSync(normalizedPath).forEach(function(file) {
            var theModule = require("./" + dir + file);
            var moduleInstance = new theModule(this.db);
            callback(moduleInstance.getInputExpr(), theModule);
        }.bind(this));
    }

    setupRoutes() {
        this.app.get('/', function(req, res) {

            if (req.query.resetlogin==='y') {
                console.log(" --- RESETTING LOGIN AUTH");
                this.options = this.db.get('options');
                this.options.findOneAndUpdate(
                    { 'has_logged_in': true }, 
                    { 'has_logged_in': false }
                ).then(function(result) {
                    console.log("Login reset result:", result);
                    if (result) this.globalLoginComplete = false;
                }.bind(this));
            }

            this.bootlines = require('./lib/bootlines.js');
            res.render('home', { bootlines: this.bootlines.get() });
        }.bind(this));
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
        console.log('User '+client.id+' connected.');
        this.sessions[client.id] = {
            currentApp: null,
            lastCmd: null
        };
        client.on('disconnect', function(){
            console.log('User '+client.id+' disconnected.');
            delete this.sessions[client.id];
        }.bind(this));
        client.on('login', function() {
            console.log("Client "+client.id+" sent LOGIN");
            this.allowSocketInputFor(client);
        }.bind(this));
    }

    allowSocketInputFor(client) {
        client.on('command', function(cmd) {
            console.log('User '+client.id+' sent command "'+cmd+'".');
            if (!this.globalLoginComplete) {
                this.processLoginAttempt(client, cmd);
            }
            else {
                this.processCommand(client, cmd);
            }
        }.bind(this));
        client.emit('begin', this.globalLoginComplete);
    }

    disableSocketInputFor(client) {
        client.on('command', function(){});
        client.emit('end');
    }

    processLoginAttempt(client, cmd) {
        if (cmd.toLowerCase()==='2016-10-29 11:00:00') {
            // set the option - TODO
            this.options.findOneAndUpdate({ 'has_logged_in': false }, { 'has_logged_in': true }).then(function(result) {
                console.log("result of updating has_logged_in", result);
            });
            this.globalLoginComplete = true;
            this.respond(client, 'Chronal adjustment confirmed, awaiting orbital insertion.');
            this.disableSocketInputFor(client);
        }
        else {
            this.respond(client, 'Error in chronal adjustment, please re-calculate.');
            // this.disableSocketInputFor(client);
        }
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
                session.currentApp = new newApp(this.db);
                session.currentApp.on('consoleapp:output', s => this.respond(client, s.s));
                session.currentApp.on('consoleapp:end',    () => delete session.currentApp);
                session.currentApp.begin();
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

    respond(client, msg) {
        console.log('Client', client.id, '- sending response "'+msg+'"');
        client.emit('response', msg);
    }

    registerApp(inputStr, className) {
        console.log("Registered app", className.name);
        this.cmds[inputStr] = className;
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
                response.on('globallogout', function() {
                    console.log("global logout");
                    this.globalLoginComplete = false;
                }.bind(this));
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
