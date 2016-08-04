var out = document.getElementById('out');
var countdown = Tock({
    countdown: true,
    interval: 1000,
    callback: function () {
        out.innerHTML = 'Initialization in '+countdown.lap()+' milliseconds...';
    },
    complete: function () {
        alert("Time's up!");
    }
});
countdown.start(countdown.timeToMS('2016-10-29 10:00:00.000'));