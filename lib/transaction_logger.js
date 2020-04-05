var logSettings = {};

var _transactionLogger = null;

function log() {
    if(_transactionLogger === null) {
        _transactionLogger = logSettings.transactionLoggerConfig().logger;
    }
    return _transactionLogger;
}

module.exports = function(appConfig) {
    logSettings = require('./log_settings.js')(appConfig);

    return {
        log: (function(){
            return log();
        })()
    }
}