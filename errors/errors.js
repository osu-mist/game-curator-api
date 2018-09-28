const JSONAPIError = require('jsonapi-serializer').Error;
const _ = require('lodash');

/**
 * @summary Construct error object
 * @function
 * @param {string} status The HTTP status code
 * @param {string} title A short, human-readable summary of the problem
 * @param {string} code An application-specific error code
 * @param {string} detail A human-readable explanation
 * @returns {Object} An error object
 */
const error = (status, title, code, detail) => ({
  status,
  title,
  code,
  detail,
  links: { about: `https://developer.oregonstate.edu/documentation/error-reference#${code}` },
});

/**
 * @summary [400] Return a Bad Request error object
 * @function
 * @param {[string]} details An array of bad request details
 * @returns {Object} Bad Request error object
 */
const badRequest = (details) => {
  const badRequests = [];
  _.forEach(details, detail => badRequests.push(error(
    '400',
    'Bad Request',
    '1400',
    detail,
  )));
  return new JSONAPIError(badRequests);
};

/**
 * @summary [401] Return a Unauthorized error object
 * @function
 * @returns {Object} Unauthorized error object
 */
const unauthorized = () => new JSONAPIError(error(
  '401',
  'Unauthorized',
  '1401',
  'Unauthorized',
));

/**
 * @summary [403] Return a Forbidden error object
 * @function
 * @param {string} detail
 * @returns {Object} Unauthorized error object
 */
const forbidden = detail => new JSONAPIError(error(
  '403',
  'Forbidden',
  '1403',
  detail,
));

/**
 * @summary [404] Return a Not Found error object
 * @function
 * @param {string} detail
 * @returns {Object} Not Found error object
 */
const notFound = detail => new JSONAPIError(error(
  '404',
  'Not found',
  '1404',
  detail,
));

/**
 * @summary [409] Return a Conflict error object
 * @function
 * @param {string} detail
 * @returns {Object} Conflict error object
 */
const conflict = detail => new JSONAPIError(error(
  '409',
  'Conflict',
  '1409',
  detail,
));

/**
 * @summary [500] Return a Internal Server Error error object
 * @function
 * @param {string} detail
 * @returns {Object} Internal Server Error error object
 */
const internalServerError = detail => new JSONAPIError(error(
  '500',
  'Internal Server Error',
  '1500',
  detail,
));

/**
 * @summary Function to handle unexpected errors
 * @function
 * @param res Response
 * @param err Error
 */
const errorHandler = (res, err) => {
  const detail = 'The application encountered an unexpected condition.';
  console.error(err.stack);
  res.status(500).send(internalServerError(detail));
};

module.exports = {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  errorHandler,
};
