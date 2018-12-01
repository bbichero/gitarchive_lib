/**
 * All API Errors Handler
 */

const logger		= require('../api/logger');
const APIError		= require('../api/error');

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

	const remoteUser = req.header('Authorization');
	const userAgent = req.header('User-Agent');
	const remoteAddress = (req.header('X-Forwarded-For') || '').split(',').pop()
		|| req.connection.remoteAddress
		|| req.socket.remoteAddress
		|| req.connection.socket.remoteAddress;

	// Doing stuff with logging the error.
	logger.error([remoteAddress, remoteUser, ("\"" + req.method + " " + req.originalUrl + "\""), error.statusCode, "\"" + userAgent + "\"", (error.data ? error.data : ""), error.message].join(" "));

	// error.data must be only for admin user (can tell critical information about the architecture)
	delete error.data;

	// Returning the error to the client.
	return res.status(error.statusCode).send(error);
};
