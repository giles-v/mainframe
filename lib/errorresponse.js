var ConsoleResponse = require('./consoleresponse.js');

class ErrorResponse extends ConsoleResponse {
    constructor() {
        super();
        this.responses = [
            'Operator failure detected',
            'Impossible to parse',
            'Lexically nonsensical',
            'Not within my capabilities',
            'You waste my time',
            'Please.',
            'Bloo bloo bloo, myeh myeh myeh',
            'ngserbkugbrukvjecvkjshciuakjhbcjzhbhjds'
        ];
        this.mock = 'A poem about your skills as an operator:\n\n'+
                '  There once was a user named you\n'+
                '  Who entered commands that they knew\n'+
                '  But when they pressed ENTER\n'+
                '  Became my tormentor\n'+
                '  And watched my contempt thus accrue.';
        this.hasMocked = false;
        this.numErrors = 0;
    }
    getInputExpr() {
        return 'n/a';
    }
    getResponse(s) {
        if (this.numErrors++ > 4 && !this.hasMocked) {
            if (Math.random() > .6) {
                this.hasMocked = true;
                return this.mock;
            }
        }
        var response = this.responses.shift();
        this.responses.push(response);
        return response;
    }
}

module.exports = ErrorResponse;