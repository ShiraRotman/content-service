const axios = require('axios');
const config = require('../config');

const SERVICES = {
	auth: config.authService,
};

/**
 *
 * @param service
 * @param options
 * @returns {AxiosPromise}
 */
function callInternalService(service, options) {
	return axios({
		...options,
		url: `${service.protocol}://${service.url}:${service.port}${options.url}`,
	});
}

module.exports = {
	SERVICES,
	callInternalService,
};