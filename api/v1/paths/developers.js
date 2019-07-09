const appRoot = require('app-root-path');
const _ = require('lodash');

const developersDao = require('../db/oracledb/developers-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get developers
 */
const get = async (req, res) => {
  try {
    const result = await developersDao.getDevelopers(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary Post developers
 * @returns {Promise<Object[]>} Promise object represents the newly created developer record
 */
const post = async (req, res) => {
  try {
    // Check that a body is present in the request
    if (_.isEmpty(req.body)) {
      errorBuilder(res, 400, ['No body in request.']);
    } else {
      const result = await developersDao.postDeveloper(req.body);
      res.status(201).send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/developers'].get;
post.apiDoc = paths['/developers'].post;

module.exports = { get, post };
