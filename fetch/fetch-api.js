const https	= require("https");
const http	= require("http");
const APIError	= require("../api/error");

module.exports = function (path, method, config, form = null) {
	// use api error lib
	if (method !== "POST" && method !== "GET")
		throw new Error("Invalid method given.");
	if (method === "POST" && !form)
		throw new Error("Form must be provide.");
	if (!config.port || !config.hostname || !config.token || !config.version)
		throw new Error("Config variable must be send.");

	// Prepare API call.
	const options = {
		port: config.port,
		hostname: config.hostname,
		path: "/v" + config.version + path,
		method: method,
		agent: false,
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Basic " + config.token
		}
	};
	if (form)
		options.headers["Content-Length"] = Buffer.byteLength(form);

	let self = this;

	return new Promise((resolve, reject) => {
		self.resolve = resolve;
		self.reject = reject;
		// Make HTTP request
		makeRequest(options, self, form = null);
	});
};

function	makeRequest (options, self, form = false, loop = false) {
	let req;

	try {
		const port = options.port == 443 ? https : http

		req = port.request(options, (res) => {
			res.setEncoding('utf8');
			let bodyResponse = "";

			if (res.statusCode === 401)
				return reject(APIError.unauthorized("Authentication required."));
			else if (res.statusCode === 302) {
				let newOptions = options;
				newOptions.path = res.headers["location"];
				if (!loop)
					makeRequest(newOptions, self, form, true);
			}
			res.on("data", data => { bodyResponse += data; });
			res.on("end", () => {

				let jsonResponse = {};
				try {
					jsonResponse = JSON.parse(bodyResponse);
					self.resolve(jsonResponse);
				}
				catch (e) {
					return self.reject(APIError.notFound("No response from API", e));
				}
			});
		});
		req.on("error", (e) => {
			return self.reject(APIError.serviceUnavailable("Unable to contact API.", e));
		})
	}
	catch (e) {
		return self.reject(APIError.serviceUnavailable("Unable to contact API.", e));
	}

	// write data to request body
	if (form)
		req.write(form);
	req.end();
};
