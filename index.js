const requestService	= require("./api/request");
const throwError	= require("./api/error");
const errorController	= require("./controllers/error");
const throwSuccess	= require("./api/success");
const gitModule		= require("./git");
const Ifetch		= require("./fetch/ifetch");
const fetchAPI		= require("./fetch/fetch-api");

module.exports = {
	request: requestService,
	error: throwError,
	errorController: errorController,
	success: throwSuccess,
	git: gitModule,
	Ifetch: Ifetch.Ifetch,
	fetchAPI: fetchAPI
}
