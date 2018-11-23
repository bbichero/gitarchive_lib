const http = require('http');
const https = require('https');
const APIError = require('./error');

// Need to separate fetchJSON function to include it everywhere a request is made
// perhabs merge fetchJSON with fetch-api ?

module.exports = {

	resource: function (config, ResourceItem={}) {

		for (key in Resource)
			{ ResourceItem[key] = Resource[key]; }

		ResourceItem.options = RequestOptions(config, "api");
		return ResourceItem;
	},

	usercontent: function (config, ResourceItem) {

		for (key in Usercontent)
			ResourceItem[key] = Usercontent[key];

		ResourceItem.options = RequestOptions(config, 'usercontent', null, ResourceItem._usercontent_id);
		return ResourceItem;
	},

	scraper: function (config) {

		const obj = {};

		for (key in Scraper)
			{ obj[key] = Scraper[key]; }

		obj.options = RequestOptions(config, "api");
		return obj;
	}

};

// Request options config

RequestOptions = function (config, type, path, usercontent_id) {

	const _path = (typeof path == "string") ? path : "";
	options = {};

	if (["api", "usercontent", null].indexOf(type) < 0) {
		console.log("Invalid request type send :", type);
		process.exit(1);
	}
	if (["api", "usercontent"].indexOf(type) > -1) {
		if (!config.hostname || !config.port || !config.version || !config.token) {
			console.log("Missing config element sent.");
			process.exit(1);
		}

		options.hostname = config.hostname; // TODO. On production, change to X.usercontent.gitarchive.com
		options.port = config.port;
		options.path = "/v" + config.version + _path;
		options.path_prefix = "/v" + config.version;
		options.headers = { Authorization: 'Basic ' + config.token }
	}
	else {
		options.path_prefix = "/v1";
		options.path = _path;
	}

	return options;
}


/**
 * Resource class
 */

Resource = {

	// id is declared as contruction
	// location is declared as contruction

	// create() stands for POST method
	// get() stands for GET request
	// set() stands for PUT request
	// delete() stands for DELETE request

	createResource: function (resourceUrl) {

		this.options.path = '/resources/';
		this.options.method = 'POST';
		this.options.onFailureMessage = 'Unable to create resource on database.';
		this.options.headers["Content-Type"] = "application/x-www-form-urlencoded"
		this.options.body = 'location=' + resourceUrl;

		return fetchJSON(this.options);
	},

	setRawBody: function (body) {

		this.options.path = '/resources/' + this.id + '/raw/body';

		return this._setRaw(this.options, body);
	},

	setRawHeaders: function (headers) {

		this.options.path = '/resources/' + this.id + '/raw/headers';

		return this._setRaw(this.options, headers);
	},

	_setRaw: function (options, data) {

		if (options.path_prefix)
			{ options.path = options.path_prefix + options.path; }

		options.method = "POST";
		options.headers['Content-Type'] = "application/octet-stream";

		return new Promise(function (resolve, reject) {
			try {
				const port = options.port == 443 ? https : http
				const request = port.request(options, res => {

					if (res.statusCode === 200)
						{ resolve(true); }

					reject(res.statusCode);
				});

				request.write(data);
				request.on("error", (e) => {
					console.error("Set raw Error:", e);
					reject(APIError.badImplementation('Unable to connect with API.'));
				});
				request.end();
			}
			catch (e) { reject(e); }
		});
	},

	createCommit: function (fetchRequest, fetchResponse) {

		this.options.path = '/resources/' + this.id + '/commits';
		this.options.method = "POST";

		return fetchJSON(this.options);
	},

	createFetch: function (fetchRequest, fetchResponse) {

		this.options.path = '/resources/' + this.id + '/fetches';
		this.options.method = "POST";
		this.options.headers["Content-Type"] = "application/x-www-form-urlencoded"

		function dateToISOString (date) {
			return (typeof date !== "undefined" && typeof date.getMonth == "function")
			? date.toISOString()
			: null;
		}

		let body = [];
		body.push('response_status_code=' + Number(fetchResponse.statusCode));
		body.push('response_content_type=' + encodeURIComponent(fetchResponse.contentType));
		body.push('response_content_length=' + Number(fetchResponse.contentLength));

		body.push('request_time_requested=' + dateToISOString(fetchRequest.timeRequested));
		body.push('request_time_completed=' + dateToISOString(fetchRequest.timeCompleted));
		body.push('request_time_responded=' + dateToISOString(fetchRequest.timeResponded));
		body.push('request_supplier=' + fetchRequest.supplier.toString());

		this.options.body = body.join('&');

		return fetchJSON(this.options)
	},

};

/**
 * Usercontent class
 */

Usercontent = {

	createResource: function () {

		this.options.path = '/resources/' + this.id;
		this.options.method = 'PUT';
		this.options.onFailureMessage = 'Unable to create a resource on usercontent.';

		return fetchJSON(this.options);
	},

	createCommit: function (ResourceItem) {

		this.options.path = '/resources/' + this.id + '/commits';
		this.options.method = 'POST';
		this.options.onFailureMessage = 'Unable to commit resource on usercontent.';

		return fetchJSON(this.options);
	},

	getDiff: function (from_commit_id, to_commit_id, fileName) {

		this.options.path = '/resources/' + this.id + '/diff/' + from_commit_id + '..' + to_commit_id + '/' + fileName;
		this.options.method = 'GET';
		this.options.onFailureMessage = 'Unable to get git-diff on usercontent.';

		return fetchJSON(this.options);
	},

	getRaw: function () {

		this.options.path = '/resources/' + resourceId + '/raw/' + commitId + '/' + fileName;
		this.options.method = 'GET';
		this.options.onFailureMessage = 'Unable to get raw data on usercontent.';

		return getUsercontentRaw(this.options, req, res, next);
	}
};

/**
 * Scraper Class
 */

Scraper = {

	getResources: function () {

		this.options.path = '/scraper/fetch';
		this.options.method = 'GET';

		return fetchJSON(this.options);
	}
}

/**
 * fetchJSON to make API request
 */

function fetchJSON (options) {

	return new Promise(function(resolve, reject) {

		if (options.path_prefix)
			{ options.path = options.path_prefix + options.path; }

		const port = options.port == 443 ? https : http
		const req = port.request(options, (APIResponse) => {

			// const { statusCode } = APIResponse;
			let body = [];
			APIResponse.on('data', (chunk) => { body.push(chunk); });
			APIResponse.on('end', () => {

				try {
					body = Buffer.concat(body).toString();

					let response = JSON.parse(body);

					if (response.statusCode && (response.statusCode >= 200 && response.statusCode < 300))
						{ return resolve(response); }
					else
						{ return reject(response); }
				}
				catch (e) {
					console.error("FetchJSON catch Error:", e);
					return reject(APIError.badImplementation('Failed to parse API response as JSON.'));
				}
			});
		});

		if (typeof options.body !== "undefined")
			{ req.write(options.body); }

		req.on("error", (e) => {
			console.error("Req.on Error:", e);
			return reject(APIError.badImplementation('Failed to contact API.'));
		});
		req.end();
	});
};
