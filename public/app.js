'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

requirejs.config({
    shim: {
        'vendor/telegraph': {
            "exports": "telegraph"
        }
    }
});

require(['vendor/telegraph', 'vendor/tock'], function (telegraph, Tock) {
    var ConsoleInput = (function () {
        function ConsoleInput(form, input) {
            _classCallCheck(this, ConsoleInput);

            this.f = form;
            this.i = input;
            this.lastCmd = false;
            this.addListeners();
            telegraph(this);
        }

        _createClass(ConsoleInput, [{
            key: 'disable',
            value: function disable() {
                this.i.setAttribute('disabled', 'disabled');
            }
        }, {
            key: 'enable',
            value: function enable() {
                this.i.removeAttribute('disabled');
                this.i.focus();
            }
        }, {
            key: 'addListeners',
            value: function addListeners() {
                this.f.addEventListener('submit', this.onFormSubmit.bind(this));
                this.i.focus();
                document.addEventListener('click', this.onDocClick.bind(this));
                this.i.addEventListener('input', this.onInput.bind(this));
                document.addEventListener('keyup', this.onKeyUp.bind(this));
            }
        }, {
            key: 'onDocClick',
            value: function onDocClick(e) {
                this.i.focus();
            }
        }, {
            key: 'onKeyUp',
            value: function onKeyUp(e) {
                if (e.keyCode === 38) {
                    // up arrow
                    this.i.value = this.lastCmd;
                    this.onInput(e);
                }
                if (e.keyCode === 40) {
                    // down arrow
                    this.i.value = '';
                    this.onInput(e);
                }
            }
        }, {
            key: 'onInput',
            value: function onInput(e) {
                this.emit('console:input', { val: this.i.value });
            }
        }, {
            key: 'onFormSubmit',
            value: function onFormSubmit(e) {
                e.preventDefault();
                var cmd = this.i.value.trim();
                if (cmd !== '') {
                    this.lastCmd = cmd;
                }
                this.emit('console:enter', { val: cmd });
                this.f.reset();
            }
        }]);

        return ConsoleInput;
    })();

    var ConsoleOutput = (function () {
        function ConsoleOutput(element) {
            _classCallCheck(this, ConsoleOutput);

            this.o = element;
            this.p = false;
            this.newLine('user');
        }

        _createClass(ConsoleOutput, [{
            key: 'newLine',
            value: function newLine(className) {
                if (this.p && this.p.childNodes.length === 0) {
                    this.p.innerHTML = '&nbsp;';
                }
                this.p = document.createElement('p');
                this.p.setAttribute('class', className);
                this.userWrite('');
                this.o.appendChild(this.p);
                this.updateScroll();
            }
        }, {
            key: 'updateLine',
            value: function updateLine(s) {
                this.p.innerHTML = s;
            }
        }, {
            key: 'setLineSource',
            value: function setLineSource(source) {
                this.p.setAttribute('class', source);
            }
        }, {
            key: 'userWrite',
            value: function userWrite(s) {
                this.updateLine('? ' + s);
            }
        }, {
            key: 'sysWrite',
            value: function sysWrite(s, className) {
                s = s.split("\n").join('<br>');
                var lineClass = 'system';
                if (className) {
                    lineClass += ' ' + className;
                }
                this.setLineSource(lineClass);
                this.updateLine('>> ' + s);
                this.newLine('user');
            }
        }, {
            key: 'disable',
            value: function disable() {
                this.updateLine('');
                this.p.classList.add('disabled');
            }
        }, {
            key: 'updateScroll',
            value: function updateScroll() {
                window.scrollTo(0, document.body.scrollHeight);
            }
        }, {
            key: 'clear',
            value: function clear() {
                this.o.innerHTML = '';
            }
        }]);

        return ConsoleOutput;
    })();

    var Console = (function () {
        function Console() {
            _classCallCheck(this, Console);

            this.endpoint = 'cmd';
            this.showIntro().then(this.init.bind(this));
        }

        _createClass(Console, [{
            key: 'showIntro',
            value: function showIntro() {
                return new Promise(function (resolve, reject) {
                    var bls = document.querySelectorAll('#boot p');
                    var bl_arr = Array.from(bls);
                    var f = function f() {
                        var bl = bl_arr.shift();
                        if (bl) {
                            bl.style.display = 'block';
                            setTimeout(f, 300 + Math.floor(500 * Math.random()));
                        } else {
                            setTimeout(resolve, 300 + Math.floor(500 * Math.random()));
                        }
                    };
                    setTimeout(f, 2000);
                });
            }
        }, {
            key: 'init',
            value: function init() {
                socket.emit('login');
                socket.on('begin', this.enable.bind(this));
                socket.on('end', this.disable.bind(this));
            }
        }, {
            key: 'enable',
            value: function enable(s) {
                this['in'] = new ConsoleInput(document.querySelector('form#cmd'), document.querySelector('input#main'));
                this.out = new ConsoleOutput(document.getElementById('out'));

                this.out.sysWrite(s);

                this['in'].on('console:input', this.onConsoleInput.bind(this));
                this['in'].on('console:enter', this.onConsoleEnter.bind(this));

                socket.on('response', this.receive.bind(this));

                document.body.classList.add('ready');
            }
        }, {
            key: 'disable',
            value: function disable() {
                this['in'].disable();
                this.out.disable();
                disableInput();
            }
        }, {
            key: 'disableInput',
            value: function disableInput() {
                this['in'].disable();
            }
        }, {
            key: 'enableInput',
            value: function enableInput() {
                this['in'].enable();
            }
        }, {
            key: 'onConsoleInput',
            value: function onConsoleInput(d) {
                this.out.userWrite(d.val);
            }
        }, {
            key: 'onConsoleEnter',
            value: function onConsoleEnter(d) {
                if (d.val && !this.runLocalCmd(d.val)) {
                    this.disableInput();
                    this.send(d.val);
                    this.out.newLine('system');
                } else {
                    this.out.newLine('user');
                }
            }
        }, {
            key: 'runLocalCmd',
            value: function runLocalCmd(s) {
                switch (s) {
                    case 'clear':
                        this.out.clear();
                        return true;
                        break;
                }
                return false;
            }
        }, {
            key: 'send',
            value: function send(command) {
                socket.emit('command', command);
            }
        }, {
            key: 'receive',
            value: function receive(o) {
                this.out.sysWrite(o.s, o.class);
                this.enableInput();
            }
        }, {
            key: 'createCountdown',
            value: function createCountdown(endDate) {
                
            }
        }]);

        return Console;
    })();

    var term = new Console();
});
