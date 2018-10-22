const lib = require('gitarchive_lib');

const APIRequest = lib.request;
const APIError = lib.error;

module.exports = {
	getUsercontentRaw :function (options, req, res, next) {
		try {
			var request = http.get(options, usercontent => {
	
				res.writeHead(usercontent.statusCode, usercontent.headers);
	
				usercontent.on("data", chunk => { return res.write(chunk); });
				usercontent.on("close", () => { return res.end(); });
				usercontent.on("end", () => { return res.end(); });
			});
	
			request.on("error", (e) => { console.error(e); return next(APIError.badImplementation('Unable to connect with usercontent')); })
		}
		catch (e) { console.error(e); return next(APIError.badImplementation('Unable to connect with usercontent')); }
	},

	setUsercontentRaw: function (options, req, res, next) {
		try {
			var request = http.request(options, usercontent => {
	
				//res.writeHead(usercontent.statusCode, usercontent.headers);
	
				usercontent.on("data", chunk => { return res.write(chunk); });
				usercontent.on("close", () => { return res.end(); });
				usercontent.on("end", () => { return res.end(); });
			});
			request.write(req.body);
	
			request.on("error", (e) => { console.error(e); return next(APIError.badImplementation('Unable to connect with usercontent')); });
			request.end();
		}
		catch (e) { console.error(e); return next(APIError.badImplementation('Unable to connect with usercontent')); }
	},

	getRaw: function (req, res, next, config, ResourceItem, commitId, fileName) {

		const options = APIRequest.usercontent(config, ResourceItem).options;

		options.path += '/resources/' + ResourceItem.id + '/raw/' + commitId + '/' + fileName;
		options.method = 'GET';
		options.onFailureMessage = 'Unable to get raw data on usercontent.';

		return this.getUsercontentRaw(options, req, res, next);
	},

	setRaw: function (req, res, next, config, ResourceItem, fileName) {

		const options = APIRequest.usercontent(config, ResourceItem).options;

		options.path += '/resources/' + ResourceItem.id + '/raw/' + fileName;
		options.method = 'POST';
		options.onFailureMessage = 'Unable to set raw data on usercontent.';

		return this.setUsercontentRaw(options, req, res, next);
	},
}
