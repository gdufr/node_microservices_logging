const appConfig = require('application-configuration')();

// These are schemas (classes) that define the high-level structure for the data that should be logged
// Variables and objects used may be further extracted, transformed, or manipulated in the log_settings.js
// serializers.
// Example: the req object is provided for many of these functions, but the serializers will decide which properties
// to actually include in the log

var types = {};

// Use this object to log requests
types.req = function req(req, reqType) {

    let service =  '',
        operation = '',
        userId = '',
        faId = '',
        customerId = '',
        jwt = '';

    if (req && req.hasOwnProperty('headers')){
        jwt = req.headers.sec02token || "";
        service = req.headers.service || '';
        operation = req.headers.name || '';
    }

    if (req && req.hasOwnProperty('headers') && req.headers.hasOwnProperty('userinfo')){
        userId = req.headers.userinfo.userId;
        faId = req.headers.userinfo.faId;
        customerId = req.headers.userinfo.customerId;
    }

    return {
        transactionId: req.id || '',
        reqType: reqType,
        logType: appConfig.constants.get('/LOGGING/LOG_TYPE/REQUEST') || '',
        service: service || '',
        operation: operation || "",
        userId: userId || '',
        faId: faId || '',
        customerId: customerId || '',
        jwt: jwt
    };
};

//Transaction Time, UserId, CustomerID, FAID and encrypted JWT.
// Use this object to log responses
types.res = function res(res) {


    let req = res.request || '',
        service =  '',
        operation = '',
        userId = '',
        faId = '',
        customerId = '',
        jwt = '';

    if (!req && res.hasOwnProperty('raw')){
        req = res.raw.req;
    }

    if (req && req.hasOwnProperty('headers')) {   
        service = req.headers.service || '';
        operation = req.headers.name || '';     

        if (req.headers.service !== "auth"){
            if (req.source){
                jwt = res.source.sec02token;
            } else {
                jwt = req.headers.sec02token || "";
            }
        }           

        if (req.headers.hasOwnProperty('userinfo')){
            userId = req.headers.userinfo.userId;
            faId = req.headers.userinfo.faId;
            customerId = req.headers.userinfo.customerId;
        }
    }

    return {
        transactionId: req.id || '',
        logType: appConfig.constants.get('/LOGGING/LOG_TYPE/RESPONSE') || '',
        transactionTime: res.transactionTime || '',
        service: service || '',
        operation: operation || "",
        userId: userId || '',
        faId: faId || '',
        customerId: customerId || '',
        jwt: jwt
    };
};

// Use this schema to log entry into functions
// All parameters are optional
types.fnEnter = function fnEnter(variables, reqType, err) {
    return types.fn(fnEnter.caller.name, variables, appConfig.constants.get('/LOGGING/LOG_TYPE/FUNCTION/ENTER'), reqType, err);
};

// Use this schema to log general lines of code
// All parameters are optional
types.fnInside = function fnInside(variables, reqType, err) {
    return types.fn(fnInside.caller.name, variables, appConfig.constants.get('/LOGGING/LOG_TYPE/FUNCTION/INSIDE'), reqType, err);
};


// Use this schema to log exit out of functions
// All parameters are optional
types.fnExit = function fnExit(variables, reqType, err) {
    return types.fn(fnExit.caller.name, variables, appConfig.constants.get('/LOGGING/LOG_TYPE/FUNCTION/EXIT'), reqType, err);
};

// Required: functionName, logType
// Optional: variables, reqType, err

types.fn = function fn(functionName, variables, logType, reqType, err) {

    reqType = reqType || appConfig.constants.get('/LOGGING/REQ_TYPE/API_CALL');

    if(variables && variables.hasOwnProperty('err')) {
        err = variables.err;
        delete variables.err;
    }
    
    var data = {
        req_id: global.reqId,
        functionName: functionName,
        variables: variables,
        logType: logType,
        reqType: reqType,
        err: err
    };

    if(variables && variables.errorResponse) {
        data.errorResponse = variables.errorResponse;
        delete variables.errorResponse;
    }

    // add the error response object to the log.  contains the statusCode, errorCode and errorMessage
    if (err && err.hasOwnProperty('response')){
        data.errorResponse = err.response;
    } else if (variables && variables.hasOwnProperty('err')){
        // have to do the if(variables) check again here because the data object doesn't exist yet in the previous check
        if (variables.err.hasOwnProperty('response')){
            data.errorResponse = variables.err.response;
        }
    }

    // variables is not an object which means that it wasn't passed in
    if(typeof variables !== 'object') {

        // Move every parameter up one spot
        data.err = reqType;
        data.reqType = logType;
        data.logType = variables;

        // variables parameter not passed in so set a default value
        data.variables = {};
    }

    // reqType is an object and there is no err defined which means that reqType wasn't passed in and
    // err was passed in place of reqType
    if(typeof data.reqType === 'object' && data.err === undefined) {
        // So reqType actually contains err, so we set err to reqType
        data.err = data.reqType;

        // reqType was not passed in, so set a default value
        data.reqType = appConfig.constants.get('/LOGGING/REQ_TYPE/API_CALL');
    }

    // If reqType is undefined it wasn't passed in (and err wasn't either), so set a default value
    data.reqType = data.reqType || appConfig.constants.get('/LOGGING/REQ_TYPE/API_CALL');

    // If err is undefined it wasn't passed in, so set a default value
    data.err = data.err || {};

    return data;
};

// This schema is used for the performance generalLogger
// 'type' is used to specify the type of I/O performed. Values include 'esb', 'ldap', 'cache', 'http'
types.performance = function performance(type, variables) {
    var returnObj = {
        transactionId: global.reqId || ''
    };

    switch(type) {
        case "http":
            returnObj.performance = {
                type: type
            }

            // only log attributes that were provided
            if (variables.gatewayStartTime){
                returnObj.performance.gatewayStartTime = variables.gatewayStartTime;
            }
            if (variables.gatewayEndTime){
                returnObj.performance.gatewayEndTime = variables.gatewayEndTime;
            }
            if (variables.requestStartTime){
                returnObj.performance.requestStartTime = variables.requestStartTime;
            }
            if (variables.requestEndTime){
                returnObj.performance.requestEndTime = variables.requestEndTime;
            }
            if (variables.gatewayStartTime && variables.gatewayEndTime){
                let totalTime;
                try {
                    totalTime = variables.gatewayEndTime - variables.gatewayStartTime;
                    returnObj.performance.totalTransactionTime =  totalTime;
                } catch(err){
                    console.log('error calculating gateway transaction time');
                }
            }
            if (variables.requestStartTime && variables.requestEndTime){
                let requestTime;
                try {
                    requestTime = variables.requestStartTime - variables.requestEndTime;
                    returnObj.performance.totalRequestTime =  requestTime;
                } catch(err){
                    console.log('error calculating request transaction time');
                }
            }

            break;

        case "esb":
            returnObj.performance = {
                type: type,
                service: variables.esbService,
                operation: variables.esbOperation,
                startTime: variables.esbStartTime,
                endTime: variables.esbEndTime,
                timeElapsed: variables.esbTimeElapsed
            }
        break;
        
        case "ldap":
            returnObj.performance = {
                type: type,
                operation: variables.ldapOperation,
                dn: variables.ldapDN,
                startTime: variables.ldapStartTime,
                endTime: variables.ldapEndTime,
                timeElapsed: variables.ldapTimeElapsed
            }
        break;

        case "cache":
        break;

        case "idp":
            returnObj.performance = {
                type: type,
                startTime: variables.idpStartTime,
                endTime: variables.idpEndTime,
                timeElapsed: variables.idpTimeElapsed
            }
        break;
    }
    return returnObj;
};

module.exports = function(appConfig) {
    appConfig = appConfig;

    return types;
}