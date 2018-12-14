'use strict';

module.exports = class ApiSuccess extends Object {

    constructor(responseType, keys) {

		const json = {}

		json.statusCode = 200;
		json.status = "succeeded";
		json.object = responseType;

		Object.keys(keys).forEach(function(key) {
			json[key] = keys[key];
		});

        return json;
    }

    // xxx

    static UsercontentResourceItem (resourceId) {
        return new ApiSuccess("usercontent_resource", {id:resourceId});
	}

	static UsercontentCommitItem (commitId) {
		return new ApiSuccess("usercontent_commit", {id:commitId});
	}

	static UsercontentDiffItem (chunks) {
		return new ApiSuccess("usercontent_diff", {data:chunks});
	}

	static UsercontentParser (data) {
		return new ApiSuccess("usercontent_parser", {data: data});
	}
}
