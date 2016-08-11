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
        }

        onDocClick(e) {
            this.i.focus();
        }

        onInput(e) {
            this.emit('console:input', { val: this.i.value });
        }

        onFormSubmit(e) {
            e.preventDefault();
            this.emit('console:enter', { val: this.i.value.trim() });
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

        userWrite(s) {
            this.updateLine('? '+s);
        }

        sysWrite(s) {
            s = s.split("\n").join('<br>   ');
            this.updateLine('>> '+s);
            this.newLine('user');
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

            setTimeout(this.enable.bind(this), 2000);
        }

        enable() {
            this.in  = new ConsoleInput(document.querySelector('form#cmd'), document.querySelector('input#main'));
            this.out = new ConsoleOutput(document.getElementById('out'));

            this.in.on('console:input', this.onConsoleInput.bind(this));
            this.in.on('console:enter', this.onConsoleEnter.bind(this));

            document.body.classList.add('ready');
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
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', this.onXHRLoaded.bind(this));
            xhr.addEventListener("error", this.onXHREnded.bind(this));
            xhr.addEventListener("abort", this.onXHREnded.bind(this));
            xhr.open('POST', this.endpoint);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({ 'cmd': command }));
        }

        onXHRLoaded(e) {
            var xhr = e.currentTarget;
            if (xhr.status >= 200 && xhr.status < 300) {
                this.receive(JSON.parse(xhr.responseText));
            }
            else {
                this.out.sysWrite('SERVER CONNECTION LOST. THE RIFT YAWNS');
            }
        }

        onXHREnded(e) {
            this.out.sysWrite('SERVER CONNECTION LOST. THE RIFT YAWNS');
        }

        receive(s) {
            this.out.sysWrite(s.msg);
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