const requestService	= require("./api/request");
const throwError	= require("./api/error");
const throwSuccess	= require("./api/success");
const gitModule		= require("./git");
const Ifetch		= require("./fetch/ifetch");

module.exports = {
	request: requestService,
	error: throwError,
	success: throwSuccess,
	git: gitModule,
	Ifetch: Ifetch
}
