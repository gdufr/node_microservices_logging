var appConfig = require('application-configuration')();

// Helper functions

var isUndefined = function isUndefined(val, newVal) {
    if(val === undefined){
        return newVal || "";
    }
    else {
        return val;
    }
};

var encryptData = function encryptData (plainData, key) {
    var encryptedData = plainData;

    return encryptedData;
};

var decryptData = function decryptData (encryptedData, key) {
    var decryptedData = encryptedData;

    return decryptedData;
}

// Serializers take complex objects and extract, transform, and manipulate them to only output the properties that we want
// for the log. Unlike log_types.js, serializers are responsible for manipulating the data.

// Logs standard request properties
function requestLogger (req) {
    if (!req || !req.connection)
        return req;

    var returnObj = {
        method: req.method,
        appHeaders: {
            service: req.headers.service,
            operation: req.headers.operation
        },
        url: req.url,
        jwt: isUndefined(req.state[appConfig.settings.get('/JWT/COOKIE/NAME')]),
        headers: req.headers
    };

    // Only log the input JSON in the transaction log if this is true
    if(appConfig.settings.get("/LOG/TRANSACTION/LOG_JSON/INPUT")) {
        returnObj.payload = encryptData(req.payload, "");
    }

    return returnObj;
};

// Logs standard response properties
function responseLogger (res) {
    if (!res || !res.statusCode) {
        return res;
    }

    var returnObj = {
        statusCode: res.statusCode,
        header: res.headers
    };

    // Only log the output JSON in the transaction log if this is true
    if(appConfig.settings.get("/LOG/TRANSACTION/LOG_JSON/OUTPUT")) {
        returnObj.payload = encryptData(res.source, "");
    }

    return returnObj;
};

// Logs the payload of a request
function payloadLogger () {
    if (!req || !req.connection) {
        return req;
    }
    else {
        // Perform logic to parse the payload and remove sensitive information
        return req.payload;
    }
};

// this is used by the log_settings.js bunyan.createLogger
function variablesLogger(variables) {

    return variables;
};


module.exports = function(appConfig) {

    appConfig = appConfig;

    return {
        requestLogger: requestLogger,
        responseLogger: responseLogger,
        payloadLogger: payloadLogger,
        variablesLogger: variablesLogger
    };
}