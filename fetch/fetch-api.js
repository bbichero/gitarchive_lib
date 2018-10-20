const http	= require("http");

module.exports = {
	/* FETCH API */
	fetchAPI: function (path, method, config, form = null) {
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
			path: "/" + config.version + path,
			method: method,
			agent: false,
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + config.token
			}
		};
		if (form)
			options.headers["Content-Length"] = Buffer.byteLength(form);

		let self = this;

		return new Promise((resolve, reject) => {
			self.resolve = resolve;
			self.reject = reject;
			// Make HTTP request
			self.makeRequest(options, form = null);
		});
	},
	makeRequest: function (options, form = false, loop = false) {
		let req;

		try {
			req = http.request(options, (res) => {
				res.setEncoding('utf8');
				let bodyResponse = "";

				if (res.statusCode === 401)
					this.reject({code: 401, message: "Authentication required."});
				else if (res.statusCode === 302) {
					let newOptions = options;
					newOptions.path = res.headers["location"];
					if (!loop)
						this.makeRequest(newOptions, form, true);
				}
				res.on("data", data => { bodyResponse += data; });
				res.on("end", () => {
					let jsonResponse = {};
					try {
						jsonResponse = JSON.parse(bodyResponse);
						this.resolve(jsonResponse);
					}
					catch (e) { this.reject({code: 404, message: "No response from API."}); }
				});
			});
			req.on("error", (e) => { this.reject({code: 500, message: "Unable to contact API."}); })
		}
		catch (e) { this.reject({code: 500, message: "Unable to contact API."}); }

		// write data to request body
		if (form)
			req.write(postData);
		req.end();
	}
};
