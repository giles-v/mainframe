var timerOut = document.getElementById('timerOut');
var p;
var countdown = Tock({
    countdown: true,
    interval: 1000,
    callback: function () {
        timerOut.innerHTML = '<p>Initialization in '+countdown.lap()+' milliseconds...</p>';
    },
    complete: function () {
        // 
    }
});
countdown.start(countdown.timeToMS('2016-10-29 10:00:00.000'));

function ajax(url, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() { 
        var success = (this.status >= 200 && this.status < 300);
        if (success && callback) {
            callback(JSON.parse(this.responseText));
        }
        else {
            systemWrites('what?');
        }
    });
    xhr.open('POST', url);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
}

var out = document.getElementById('out');
function newLine() {
    if (p && p.childNodes.length === 0) {
        p.innerHTML = '&nbsp;';
    }
    p = document.createElement('p');
    out.appendChild(p);
    input.value = '';
}

function updateLine(s) {
    p.innerHTML = s;
}

function systemWrites(s) {
    newLine();
    updateLine('> '+s);
    newLine();
    newLine();
}

function handleResponse(s) {
    systemWrites(s);
}

var form = document.getElementById('cmd');
var input = document.getElementById('main');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value.trim() !== '') {
        ajax('foo', { cmd: input.value }, handleResponse);
    }
    newLine();
});
input.focus();
document.addEventListener('click', function(e) {
    input.focus();
});
input.addEventListener('input', function(e) {
    updateLine(input.value);
});

newLine();