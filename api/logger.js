const { createLogger, format, transports } = require('winston');
const path = require('path')

const LOG_DIR = path.join(__dirname, '../../../logs');
const LOG_ERROR_FILE = path.join(LOG_DIR, "error.log");
const LOG_INFO_FILE = path.join(LOG_DIR, "combined.log");

const logger = createLogger({
	format: format.combine(
		format.timestamp(), 
		format.json()
	),
	transports: [
            new transports.Console({
				format: format.combine(
					format.colorize(),
					format.timestamp(), 
					format.printf(log => `${log.timestamp} ${log.level}: ${log.message}`)
				),
                level:'debug',
                name: 'console',
                handleExceptions: true,
                // prettyPrint: true,
                // silent:false,
                // timestamp: true,
                // colorize: true,
                // json: false
            }),
            new transports.File({ // consider transports.DailyRotateFile()
				format: format.combine(format.timestamp(),format.json()),
				level:'info',
                name: 'info',
                filename: LOG_INFO_FILE,
                // handleExceptions: true,
                // prettyPrint: true,
                // silent:false,
                // timestamp: true,
                // json: true,
                // colorize: true,
                // maxsize: 20000,
                // tailable: true
            }),
            new transports.File({
                level:'error',
                name: 'error',
                filename: LOG_ERROR_FILE,
                handleExceptions: true,
                prettyPrint: true,
                silent: false,
                timestamp: true,
                json: true,
                colorize: false,
                maxsize: 20000,
                tailable: true
            })
        ],
  });

module.exports = logger;
