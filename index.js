const requestService	= require("./api/request");
const throwError	= require("./api/error");
const content		= require("./api/userContent");
const errorController	= require("./controllers/error");
const throwSuccess	= require("./api/success");
const gitModule		= require("./git");
const Ifetch		= require("./fetch/ifetch");
const fetchAPI		= require("./fetch/fetch-api");
const logger		= require("./api/logger");

module.exports = {
	request: requestService,
	error: throwError,
	errorController: errorController,
	success: throwSuccess,
	git: gitModule,
	Ifetch: Ifetch,
	fetchAPI: fetchAPI,
	setRaw: content.setRaw,
	getRaw: content.getRaw,
	logger: logger
}
