'use strict';

const	logger = require("./logger");

// Inspired from https://www.npmjs.com/package/boom
module.exports = class CustomBoom extends Error {

	constructor(err, options = {}) {
		if (err instanceof Error) { return err; }

		const { statusCode = 500, data = null } = options;

		const error = new Error(err ? err : undefined);   // Avoids settings null message
		Error.captureStackTrace(error);                   // Filter the stack to our external API
		error.data = data;
		error.statusCode = statusCode;

		// log error with winston
//		logger.error(`code: ${error.statusCode}` + (error.data ? `, ${error.data}` : "") + `, message: ${error.message}`);

		return error;
	}

	// 4xx

	static badRequest (message, data) {
		return new CustomBoom(message, {statusCode: 400, data: data});
	}

	static unauthorized (message, data) {
		return new CustomBoom(message, {statusCode: 401, data: data});
	}

	static notFound (message, data) {
		return new CustomBoom(message, {statusCode: 404, data: data});
	}

	// 5xx

	static badImplementation (message, data) {
		// TODO. Message should be hidded.
		return new CustomBoom(message, {statusCode: 500, data: data});
	}

	static notImplemented (message, data) {
		return new CustomBoom(message, {statusCode: 501, data: data});
	}

	static serviceUnavailable (message, data) {
		return new CustomBoom(message, {statusCode: 503, data: data});
	}

}
