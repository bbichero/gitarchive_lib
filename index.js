const requestService	= require("./lib/request");
const throwError	= require("./lib/error");
const throwSuccess	= require("./lib/success");
const gitModule		= require("./git");

module.exports = {
	request: requestService,
	error: throwError,
	success: throwSuccess,
	git: gitModule,
}
