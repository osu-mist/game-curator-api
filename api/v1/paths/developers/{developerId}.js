const appRoot = require('app-root-path');

const developersDao = require('../../db/oracledb/developers-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get developer by unique ID
 */
const get = async (req, res) => {
  try {
    const { developerId } = req.params;
    const result = await developersDao.getDeveloperById(developerId);
    if (!result) {
      errorBuilder(res, 404, 'A developer with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

/**
 * @summary Delete developer by unique ID
 */
const del = async (req, res) => {
  try {
    const { developerId } = req.params;
    const result = await developersDao.deleteDeveloper(developerId);
    if (result.rowsAffected < 1) {
      errorBuilder(res, 404, 'A developer with the specified ID was not found.');
    } else {
      // send 204 on successful delete
      res.sendStatus(204);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/developers/{developerId}'].get;

module.exports = { get, del };
