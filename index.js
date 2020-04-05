var appConfig = {},
	logTypes = {},
	logSettings = {},
	generalLogger = {},
	transactionLogger = {},
	performanceLogger = {};


module.exports = function (config) {
	// Initialize opts in case it isn't passed in
	config = config || {};

	// Get default data from files, otherwise initialize empty objects
	var settings = {},
		constants = {};

	// If config contains a setting property, then merge that setting property with the default settings
	// This allows us to override the default settings with our own settings. The merge deals with conflicts by using the values from config.
	if (config.hasOwnProperty('settings')) {
		Object.assign(settings, config.settings);
	}

	// This works exactly the same way as settings
	if (config.hasOwnProperty('constants')) {
		Object.assign(constants, config.constants);
	}

	config.settings = settings;
	config.constants = constants;

	appConfig = require('application-configuration')(config);

	logTypes = require('./lib/log_types.js')(appConfig);
	logSettings = require('./lib/log_settings.js')(appConfig);
	generalLogger = require('./lib/general_logger.js')(appConfig);
	transactionLogger = require('./lib/transaction_logger.js')(appConfig);
	performanceLogger = require('./lib/performance_logger.js')(appConfig);

	return {
		logTypes: logTypes,
		logSettings: logSettings,
		general: generalLogger,
		transaction: transactionLogger,
		performance: performanceLogger
	};
} 
