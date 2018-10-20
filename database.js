const promise		= require("bluebird"); // or any other Promise/A+ compatible library;
const config	    	= require("../config");
const APIError		= require('./api/error');

const initOptions	= {
	    promiseLib: promise // overriding the default (ES6 Promise);
};
const pgp		= require('pg-promise')(initOptions);

// Database connection details;
const cn		= {
	host: config.services.db.hostname,
	port: config.services.db.port,
	database: config.services.db.database,
	user: config.services.db.username,
	password: config.services.db.password,
    	ssl: true
};

// Instantiate connection
const db = pgp(cn);

// Surcharge db object witb a lib object...
const Database = Object.assign({

	lib: {
		// ...with a custom errors handler,
		handleErrors: function (err) {
			if (err.statusCode)
				throw err;
			else
				throw APIError.notImplemented(err);
		},

		// ...with a custom query limit.
		sqlQueryLimit: function (limit) {
			const SQL_DEFAULT_LIMIT = 25;
			return (Number(limit) && limit > 0 && limit < SQL_DEFAULT_LIMIT * 10 ? limit : SQL_DEFAULT_LIMIT);
		},

		formatNumber: function (int) { return isNaN(int) ? 0 : int; },

		formatDate: function (date) {
			if (typeof date !== "undefined" && typeof date.getMonth == "function")
				{ return date; }
			
			const dateObj = new Date(date);

			return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
		}
	}
}, db);

module.exports = Database;
