var logSettings = {};

var _performanceLogger = null;

function log() {
    if(_performanceLogger === null) {
        _performanceLogger = logSettings.performanceLoggerConfig().logger;
    }
    return _performanceLogger;
}

module.exports = function(appConfig) {
    logSettings = require('./log_settings.js')(appConfig);

    return {
        log: (function(){
            return log();
        })()
    }
}