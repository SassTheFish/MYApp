class ExpressError extends Error 
{
    constructor(message = 'Some kind of error occurred', statusCode = 400) 
    {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}
module.exports = ExpressError;