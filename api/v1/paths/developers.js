const appRoot = require('app-root-path');

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
 */
const post = async (req, res) => {
  try {
    console.log('received post');
    // Check that a body is present in the request
    if (!req.body) {
      errorBuilder(res, 400, ['No body in request.']);
    } else {
      const result = await developersDao.postDeveloper(req.body);
      res.status(201).send(result);
    }
  } catch (err) {
    console.log('sup');
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/developers'].get;
post.apiDoc = paths['/developers'].post;

module.exports = { get, post };
