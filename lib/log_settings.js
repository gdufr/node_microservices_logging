var fs = require('fs'),
    bunyan = require('bunyan'),
    appConfig = require('application-configuration')(),
    serializers = {};

function generalLoggerConfig() {

    var streams = [];

    var isActive = appConfig.settings.get('/LOG/GENERAL/IS_ACTIVE');
    var logLevel = appConfig.settings.get('/LOG/GENERAL/LEVEL');
    var logConsoleLevel = appConfig.settings.get('/LOG/GENERAL/TO_CONSOLE');
    var logLocation = appConfig.settings.get('/LOG/GENERAL/LOCATION');

    // If the logs directory defined in '/LOG/LOCATION' doesn't exist yet, create it

    if (!fs.existsSync(logLocation)){
        fs.mkdirSync(logLocation);
    }

    // Based on the logLevel, choose which logs to use. In production we want to only use 50 and 60. In dev and test,
    // we may choose to use all of them.
    // This switch statement falls through to subsequent conditions and matches all that are true
    // For example, if logLevel = 20, it will execute for all cases 20 and above
    // **IMPORTANT** We want each case statement to fall through to the next so we don't have break statements
    switch(isActive) {
        case logLevel <= 10 || logConsoleLevel == 10:

            if(logLevel <= 10) { streams.push({ level: 'trace', path: logLocation + appConfig.settings.get('/LOG/GENERAL/FILENAME/TRACE')}); }
            if(logConsoleLevel <= 10) { streams.push({ level: 'trace', stream: process.stdout}); }

        case logLevel <= 20 || logConsoleLevel == 20:

            if(logLevel <= 20) { streams.push({ level: 'debug', path: logLocation + appConfig.settings.get('/LOG/GENERAL/FILENAME/DEBUG')}); }
            if(logConsoleLevel <= 20) { streams.push({ level: 'debug', stream: process.stdout}); }

        case logLevel <= 30 || logConsoleLevel == 30:

            if(logLevel <= 30) { streams.push({ level: 'info', path: logLocation + appConfig.settings.get('/LOG/GENERAL/FILENAME/INFO')}); }
            if(logConsoleLevel <= 30) { streams.push({ level: 'info', stream: process.stdout}); }

        case logLevel <= 40|| logConsoleLevel == 40:

            if(logLevel <= 40) { streams.push({ level: 'warn', path: logLocation + appConfig.settings.get('/LOG/GENERAL/FILENAME/WARN')}); }
            if(logConsoleLevel <= 40) { streams.push({ level: 'warn', stream: process.stdout}); }

        case logLevel <= 50 || logConsoleLevel == 50:

            if(logLevel <= 50) { streams.push({ level: 'error', path: logLocation + appConfig.settings.get('/LOG/GENERAL/FILENAME/ERROR')}); }
            if(logConsoleLevel <= 50) { streams.push({ level: 'error', stream: process.stdout}); }

        case logLevel <= 60 || logConsoleLevel == 60:

            if(logLevel <= 60) { streams.push({ level: 'fatal', path: logLocation + appConfig.settings.get('/LOG/GENERAL/FILENAME/FATAL')}); }
            if(logConsoleLevel <= 60) { streams.push({ level: 'fatal', stream: process.stdout}); }

    }

    // Defines the serializers used
    return {
        logger: bunyan.createLogger({
            name: 'mapp_general',
            serializers: {
                req: serializers.requestLogger,
                res: serializers.responseLogger,
                err: bunyan.stdSerializers.err,
                payload: serializers.payloadLogger,
                variables: serializers.variablesLogger
            },
            streams: streams,
            NODE_ENV: process.env.NODE_ENV,
            microserviceName: process.env.microserviceName
        })
    };
};

function transactionLoggerConfig() {
    var streams = [];

    var isActive = appConfig.settings.get('/LOG/TRANSACTION/IS_ACTIVE');
    var toConsole = appConfig.settings.get('/LOG/TRANSACTION/TO_CONSOLE');
    var logLocation = appConfig.settings.get('/LOG/TRANSACTION/LOCATION');

    // If the logs directory defined in '/LOG/LOCATION' doesn't exist yet, create it
    if (!fs.existsSync(logLocation)){
        fs.mkdirSync(logLocation);
    }

    if(isActive) {
        var stream = {
            level: 'info', // 10
            path: logLocation + appConfig.settings.get('/LOG/TRANSACTION/FILENAME/INFO')
        };
        streams.push(stream);

        if(toConsole) {
            // Create a separate 'stream' object for outputting to console. Not sure why there needs to be a separate stream for file and for console
            // The general generalLogger configuration works when both file and console are combined in one 'stream' object
            streams.push({
                level: 'info',
                stream: process.stdout
            });
        }

    }

    return {
        logger: bunyan.createLogger({
            name: 'mapp_transaction',
            serializers: {
                req: serializers.requestLogger,
                res: serializers.responseLogger,
                err: bunyan.stdSerializers.err,
                payload: serializers.payloadLogger,
                variables: serializers.variablesLogger
            },
            streams: streams,
            NODE_ENV: process.env.NODE_ENV,
            microserviceName: process.env.microserviceName
        })
    };
};

function performanceLoggerConfig() {
    var streams = [];

    var isActive = appConfig.settings.get('/LOG/PERFORMANCE/IS_ACTIVE');
    var toConsole = appConfig.settings.get('/LOG/PERFORMANCE/TO_CONSOLE');
    var logLocation = appConfig.settings.get('/LOG/PERFORMANCE/LOCATION');

    // If the logs directory defined in '/LOG/LOCATION' doesn't exist yet, create it
    if (!fs.existsSync(logLocation)){
        fs.mkdirSync(logLocation);
    }

    if(isActive) {
        var stream = {
            level: 'info', // 10
            path: logLocation + appConfig.settings.get('/LOG/PERFORMANCE/FILENAME/INFO')
        };
        streams.push(stream);

        if(toConsole) {
            // Create a separate 'stream' object for outputting to console. Not sure why there needs to be a separate stream for file and for console
            // The general generalLogger configuration works when both file and console are combined in one 'stream' object
            streams.push({
                level: 'info',
                stream: process.stdout
            });
        }

    }

    return {
        logger: bunyan.createLogger({
            name: 'mapp_performance',
            serializers: {
                req: serializers.requestLogger,
                res: serializers.responseLogger,
                err: bunyan.stdSerializers.err,
                payload: serializers.payloadLogger,
                variables: serializers.variablesLogger
            },
            streams: streams,
            NODE_ENV: process.env.NODE_ENV,
            microserviceName: process.env.microserviceName
        })
    };
};

module.exports = function(_appConfig) {
    appConfig = _appConfig;

    serializers = require('./log_serializers.js')(_appConfig);

    return {
        generalLoggerConfig: generalLoggerConfig,
        transactionLoggerConfig: transactionLoggerConfig,
        performanceLoggerConfig: performanceLoggerConfig
    };
}