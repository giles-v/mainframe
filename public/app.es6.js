'use strict';

requirejs.config({
    shim: {
        'vendor/telegraph': {
            "exports": "telegraph"
        }
    }
});

require(['vendor/telegraph', 'vendor/tock'], function(telegraph, Tock) {

    class ConsoleInput {
        constructor(form, input) {
            this.f = form;
            this.i = input;
            this.lastCmd = false;
            this.addListeners();
            telegraph(this);
        }

        disable() {
            this.i.setAttribute('disabled', 'disabled');
        }

        enable() {
            this.i.removeAttribute('disabled');
            this.i.focus();
        }

        addListeners() {
            this.f.addEventListener('submit', this.onFormSubmit.bind(this));
            this.i.focus();
            document.addEventListener('click', this.onDocClick.bind(this));
            this.i.addEventListener('input', this.onInput.bind(this));
            document.addEventListener('keyup', this.onKeyUp.bind(this));
        }

        onDocClick(e) {
            this.i.focus();
        }

        onKeyUp(e) {
            if (e.keyCode===38) { // up arrow
                this.i.value = this.lastCmd;
                this.onInput(e);
            }
            if (e.keyCode===40) { // down arrow
                this.i.value = '';
                this.onInput(e);
            }
        }

        onInput(e) {
            this.emit('console:input', { val: this.i.value });
        }

        onFormSubmit(e) {
            e.preventDefault();
            var cmd = this.i.value.trim();
            if (cmd!=='') {
                this.lastCmd = cmd;
            }
            this.emit('console:enter', { val: cmd });
            this.f.reset();
        }
    }

    class ConsoleOutput {
        constructor(element) {
            this.o = element;
            this.p = false;
            this.newLine('user');
        }

        newLine(className) {
            if (this.p && this.p.childNodes.length === 0) {
                this.p.innerHTML = '&nbsp;';
            }
            this.p = document.createElement('p');
            this.p.setAttribute('class', className);
            this.userWrite('');
            this.o.appendChild(this.p);
            this.updateScroll();
        }

        updateLine(s) {
            this.p.innerHTML = s;
        }

        setLineSource(source) {
            this.p.setAttribute('class', source);
        }

        userWrite(s) {
            this.updateLine('? '+s);
        }

        sysWrite(s) {
            s = s.split("\n").join('<br>   ');
            this.setLineSource('system');
            this.updateLine('>> '+s);
            this.newLine('user');
        }

        disable() {
            this.updateLine('');
            this.p.classList.add('disabled');
        }

        updateScroll() {
            window.scrollTo(0, document.body.scrollHeight);
        }

        clear() {
            this.o.innerHTML = '';
        }
    }

    class Console {
        constructor() {
            this.createCountdown('2016-10-29 10:00:00.000');
            this.endpoint = 'cmd';

            socket.emit('login');
            socket.on('begin', this.enable.bind(this));
            socket.on('end',   this.disable.bind(this));
        }

        enable(s) {
            this.in  = new ConsoleInput(document.querySelector('form#cmd'), document.querySelector('input#main'));
            this.out = new ConsoleOutput(document.getElementById('out'));

            this.out.sysWrite(s
                ? 'Welcome back, user.'
                : 'Interloper detected. Identify yourself'
            );

            this.in.on('console:input', this.onConsoleInput.bind(this));
            this.in.on('console:enter', this.onConsoleEnter.bind(this));

            socket.on('response', this.receive.bind(this));

            document.body.classList.add('ready');
        }

        disable() {
            this.in.disable();
            this.out.sysWrite('--== SESSION ENDS ==--');
            this.out.disable();
            disableInput();
        }

        disableInput() {
            this.in.disable();
        }

        enableInput() {
            this.in.enable();
        }

        onConsoleInput(d) {
            this.out.userWrite(d.val);
        }

        onConsoleEnter(d) { 
            if (d.val && !this.runLocalCmd(d.val)) {
                this.disableInput();
                this.send(d.val);
                this.out.newLine('system');
            }
            else {
                this.out.newLine('user');
            }
        }

        runLocalCmd(s) {
            switch(s) {
                case 'clear':
                    this.out.clear();
                    return true;
                break;
            }
            return false;
        }

        send(command) {
            socket.emit('command', command);
        }

        receive(s) {
            this.out.sysWrite(s);
            this.enableInput();
        }

        createCountdown(endDate) {
            var countdown = Tock({
                countdown: true,
                interval: 1000,
                callback: function () {
                    document.getElementById('timerOut').innerHTML = 'Initialization in '+countdown.lap()+' milliseconds.';
                }
            });
            countdown.start(countdown.timeToMS(endDate));
        }
    }

    var term = new Console();

});