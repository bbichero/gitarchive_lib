const APIRequest = require("./request");
const APIError = require("./error");
const http = require("http");
const https = require("https");

// Change https call by fetchAPI or other lib function request
module.exports = {
	getUsercontentRaw: (options, req, res, next) => {
		try {
			var request = https.request(options, usercontent => {

				//res.writeHead(usercontent.statusCode, usercontent.headers);

				usercontent.on("data", chunk => { return res.write(chunk); });
				usercontent.on("close", () => { return res.end(); });
				usercontent.on("end", () => { return res.end(); });
			});

			request.write(req.body);
			request.on("error", (e) => {
				return next(APIError.badImplementation('Unable to connect with usercontent', e));
			})
			request.end();
		}
		catch (e) {
			return next(APIError.badImplementation('Unable to connect with usercontent', e));
		}
	},

	setUsercontentRaw: (options, req, res, next) => {
		try {
			var request = https.request(options, usercontent => {

				//res.writeHead(usercontent.statusCode, usercontent.headers);

				usercontent.on("data", chunk => { return res.write(chunk); });
				usercontent.on("close", () => { return res.end(); });
				usercontent.on("end", () => { return res.end(); });
			});
			request.write(req.body);
			request.on("error", (e) => {
				return next(APIError.badImplementation('Unable to connect with usercontent', e));
			});
			request.end();
		}
		catch (e) {
			return next(APIError.badImplementation('Unable to connect with usercontent', e));
		}
	},

	getRaw: (req, res, next, config, ResourceItem, commitId, fileName) => {

		const options = APIRequest.usercontent(config, ResourceItem).options;

		options.path += '/resources/' + ResourceItem.id + '/raw/' + commitId + '/' + fileName;
		options.method = 'GET';
		options.onFailureMessage = 'Unable to get raw data on usercontent.';

		return module.exports.getUsercontentRaw(options, req, res, next);
	},

	setRaw: (req, res, next, config, ResourceItem, fileName) => {

		const options = APIRequest.usercontent(config, ResourceItem).options;

		options.path += '/resources/' + ResourceItem.id + '/raw/' + fileName;
		options.method = 'POST';
		options.onFailureMessage = 'Unable to set raw data on usercontent.';

		return module.exports.setUsercontentRaw(options, req, res, next);
	},
}
