const {callInternalService, SERVICES} = require('../../helpers/internal-service');


/**
 *  The Auth Checker middleware function.
 */
module.exports = (req, res, next) => {
	if (!req.headers.authorization) {
		return res.status(401).end();
	}

	return callInternalService(SERVICES.auth, {
		headers: {
			authorization: req.headers.authorization,
		},
		url: '/api/me',
	})
		.then(axiosRes => axiosRes.data)
		.then(user => {
			req.user = user;
			return next();
		})
		.catch(() => {
			return res.status(401).end();
		});
};
