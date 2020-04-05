var path = require('path'),
    logSettings = {};

var _generalLogger = null;

function log() {
    if(_generalLogger === null) {
        _generalLogger = logSettings.generalLoggerConfig().logger;
    }
    return _generalLogger;

}

module.exports = function(appConfig) {

    logSettings = require('./log_settings.js')(appConfig);

    return {
        log: (function(){
            return log();
        })()
    };
}
