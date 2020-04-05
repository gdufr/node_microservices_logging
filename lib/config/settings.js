var fs = require('fs');
var path = require('path');

module.exports =
{
    /* Log Settings */
    "LOG": {
        "GENERAL": {
            "IS_ACTIVE": {
                "$filter": "env",
                "local": true,
                "$default": true
            },
            // Will output logs to the console for ONLY the level chosen (this is to avoid outputting duplicate logs)
            // Values: 10 (trace), 20 (debug), 30 (info), 40 (warn), 50 (error), 60 (fatal). Refer to log_settings.js for levels.
            // 100 to turn off all logs (really any value over 60)
            "TO_CONSOLE": {
                "$filter": "env",
                "local": 10,

                "$default": 100
            },
            // Will output logs to the log files for the level chosen, and levels above that
            // Values: 10 (trace), 20 (debug), 30 (info), 40 (warn), 50 (error), 60 (fatal). Refer to log_settings.js for levels.
            // 100 to turn off all logs (really any value over 60)
            "LEVEL": {
                "$filter": "env",
                "local": 10,

                "$default": 10
            },
            "LOCATION": "./logs/", // Location to save the logs, needs the trailing "/"
            "FILENAME": {
                "FATAL": "fatal.log",
                "ERROR": "error.log",
                "WARN": "warn.log",
                "INFO": "info.log",
                "DEBUG": "debug.log",
                "TRACE": "trace.log"
            }
        },

        // Used to log only requests and responses
        // This will turned on for all environments
        "TRANSACTION": {
            // Controls whether any logging will be done
            "IS_ACTIVE": {
                "$filter": "env",
                "local": true,

                "$default": true
            },
            // Controls whether the raw JWT payload is logged (default should be FALSE for higher environments)
            "LOG_JWT_PAYLOAD": {
                "$filter": "env",
                "local": false,

                "$default": false
            },

            // Controls whether input/output JSON will be logged (default should be FALSE for higher environments)
            "LOG_JSON": {
                "INPUT": {
                    "$filter": "env",
                    "local": true,

                    "$default": false
                },
                "OUTPUT": {
                    "$filter": "env",
                    "local": true,

                    "$default": false
                }
            },
            // Controls whether the logs will be written to console (transaction logs are always logged to file)
            "TO_CONSOLE": {
                "$filter": "env",
                "local": true,

                "$default": false
            },
            "LOCATION": "./logs/", // Location to save the logs, needs the trailing "/"
            "FILENAME": {
                "INFO": "transaction.log"
            }

        }
    }, 
}