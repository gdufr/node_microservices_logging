## Synopsis

This is the custom logging library that uses Bunyan for log4j-style JSON logging.

There are two types of logs:
General:
The general log is what logs details about the code and execution such as enter/exit of functions, values of variables, or any other valuable information you want to log. This will allow us to trace through the log files and follow the execution steps of a request.

Transaction:
The transaction log is used to *only* capture the request and response information for a single request. It will not include anything from the general log. Transaction logs should always be logged at the INFO level.

The reason why we have two separate logs is because we want the transaction log to always be on for all environments. The general log will vary depending on the environment so we want to isolate these two logs.


## Initialization

```javascript
var generalLogger = require('logging')();
```

Note: the () after the require statement is mandatory.

The cache object exposes a function called getRedisClient() that is used to initiate commands with the Redis server.

This module is bundled with its own set of default app_settings and constants. These app_settings and constants can be overridden by passing in an object containing one or both of these properties.

## Usage

```javascript
var logging = require('logging')();

logging.general.log.info('this is a sample general log at the INFO level');
logging.general.log.error('you can also log things to the ERROR log level');

logging.transaction.log.info('this is a sample transaction log that is used to log requests/responses');

```

## Other Considerations

In addition to manually logging things, there is also a Hapi plugin for Bunyan called [hapi-bunyan](https://github.com/silas/hapi-bunyan). This plugin automatically hooks into certain events in the Hapi request lifecycle and automatically logs things to the general log for these events. We should also use this.

Example of registering the hapi-bunyan plugin:

```javascript
// Create the object that is used to register the plugin
var configBunyan = {
    register: require('hapi-bunyan'),
    options: {generalLogger: generalLogger.log}
};

// Register the plugin
server.register(plugins, function (err) {
    if (err) {
        return err;
    } else {
        server.start(function (err) {
            if (err) {
                throw err;
            } else {
                server.route(require('./routes/public-api'));                
            }
        });
    }
});

```