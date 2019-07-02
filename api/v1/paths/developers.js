const appRoot = require('app-root-path');

const developersDao = require('../db/oracledb/developers-dao');

const { errorHandler } = appRoot.require('errors/errors');
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

get.apiDoc = paths['/developers'].get;

module.exports = { get };
