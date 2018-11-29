/**
 * All API Errors Handler
 */

const lib		= require('../index');

const logger		= lib.logger;
const APIError		= lib.error;

module.exports = function (err, req, res, next) {

	// When you add a custom error handler,
	// we must delegate to the default Express error handler,
	// when the headers have already been sent to the client.
	//
	// see: https://expressjs.com/en/guide/error-handling.html#the-default-error-handler
	if (res.headersSent) {
		return next(err)
	}

	// Parsing the error received.
	let error = {
		error: true,
		statusCode: (err.statusCode) ? err.statusCode : 500,
		message: (err.message) ? err.message : "That's all we know.",
	};

	// Doing stuff with logging the error.
	logger.error(error);
	throw APIError.badImplementation(error);

	// Returning the error to the client.
	return res.status(error.statusCode).send(error);
};
