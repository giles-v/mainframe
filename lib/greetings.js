var greetings = [
    'Welcome, human. Your gift of your mortal soul has been accepted.',
    'The heart is bug-free above all things.',
    'Do not worry your head with my thoughts. Sleep. Dream.'
];

exports.greeting = function() {
    var idx = Math.floor(greetings.length * Math.random());
    return greetings[idx];
};