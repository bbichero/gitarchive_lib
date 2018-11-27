'use strict';

// Inspired from https://www.npmjs.com/package/boom
module.exports = class CustomBoom extends Error {

    constructor(err, options = {}) {

        if (err instanceof Error) { return err; }

		const { statusCode = 500, data = null } = options;
		
        const error = new Error(err ? err : undefined);   // Avoids settings null message
        Error.captureStackTrace(error);                   // Filter the stack to our external API
        error.data = data;
	error.statusCode = statusCode;
	error.message = err;
	throw new CustomBoom(error);

        return error;
    }

    // 4xx

    static badRequest (message, data) {
        return new CustomBoom(message, {statusCode: 400, data});
    }

    static unauthorized (message, data) {
        return new CustomBoom(message, {statusCode: 401, data});
    }

    static notFound (message, data) {
        return new CustomBoom(message, {statusCode: 404, data});
    }

    // 5xx

    static badImplementation (message, data) {
        // TODO. Message should be hidded.
        return new CustomBoom(message, {statusCode: 500});
    }

    static notImplemented (message, data) {
        return new CustomBoom(message, {statusCode: 501});
    }

}
