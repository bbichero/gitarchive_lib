/**
 * @fileoverview Intelligent fetch.
 * 
 * Helps make:
 * - internal http/https requests ;
 * - or external requests (scraperapi.com, etc.).
 * 
 * @return Promise with (resource, request, response)
 */

const NativeRequest = require('./native-request.js')
const REQUEST_TIMEOUT = 3 * 8 * 1000;
const logger		= require("../api/logger");

/* ^_^ */

let iFetch = function (resource) {

	if (!resource || typeof resource !== "object") { resource = {}; }

	if (!resource.location)
		{ throw new Error('Resource\’s location is missing', 400); }

	if (!resource.id)
		{ throw new Error('Resource\’s id is missing', 400); }

	this.resource = {};
	this.resource.location = resource.location;
	this.resource.id = resource.id;

	this.request = {};
	this.request.supplier = "internal";
	this.request.timeInitialized = new Date();

	this.response = {};

	let self = this;

	return new Promise(function (resolve, reject) {
		self.resolve = resolve;
		self.reject = reject;
		self.makeRequest();
	});
}

iFetch.prototype.makeRequest = function () {

	let self = this

	self.request.timeRequested = new Date();
	self.log(self.resource.id, 'making request');

	if (self.request.supplier == "internal") {
		return self.makeInternalRequest();
	}
}

iFetch.prototype.makeInternalRequest = function () {

	const self = this;

	/**
	 * WARNING!
	 * TODO limit file size to fetch (with a global env.js) 
	 */

	const request = NativeRequest(self.resource.location, function (res) {

		self.request.timeResponded = new Date();

		self.log(self.resource.id, 'responded with status code', res.statusCode);

		self.response.statusCode = Number(res.statusCode);
		self.response.contentType = res.headers['content-type'];
		self.response.contentLength = res.headers['content-length'];

		self.response.headers = res.statusCode + ' ' + res.statusMessage;
		for (let i = 0, n = res.rawHeaders.length ; i < n ; i += 2)
			{ self.response.headers += "\n" + res.rawHeaders[i] + ': ' + res.rawHeaders[i+1] }

		self.response.body = [];

		res.on("data", (chunk) => { self.response.body.push(chunk); })
		res.on("end", () => {
			self.response.body = Buffer.concat(self.response.body);
			self.request.timeCompleted = new Date();
			self.onSuccess();
		});
	})

	request.on('socket', function (socket) {
		socket.setTimeout(REQUEST_TIMEOUT);
		socket.on('timeout', function() { request.abort(); });
	});

	request.on('error', (error) => {
		if (error.code == "ECONNREFUSED") { self.response.statusCode = 1; }
		else if (error.code == "ECONNRESET") { self.response.statusCode = 2; }
		else if (error.message.indexOf("ERR_TLS_CERT_ALTNAME_INVALID")) { self.response.statusCode = 3; }

		self.request.timeCompleted = new Date();

		return self.onError(error);
	})
	// request.on("abort", () => { });
};

iFetch.prototype.log = function (msg) {

	msg = msg.toString();
	for (var i = 1; i < arguments.length; i++) {
		msg += " " + arguments[i].toString();
	}

	return logger.info(msg);
}

// This internal event is only called if an error occurred with the request
// (you can never have both an error and a success callback with a request).
iFetch.prototype.onError = function (error) {

	const self = this;

	error.fetchRequest = self.request;
	error.fetchResponse = self.response;

	return this.reject(error);
}

// This internal event is called once the request has responded
iFetch.prototype.onSuccess = function () {

	return this.resolve([this.resource, this.request, this.response]);
}

// Exporting iFetch lib.
module.exports = iFetch;
