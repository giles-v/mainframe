var greetings = require('../lib/greetings.js'); 
var expect = require('chai').expect;

suite('system greeting tests', function(){
    test(
        'greeting() should return a string greeting',
        function() { 
            expect(typeof greetings.greeting() === 'string');
        }
    );
});
