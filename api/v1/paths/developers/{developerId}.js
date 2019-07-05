const appRoot = require('app-root-path');

const developersDao = require('../../db/oracledb/developers-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get pet by unique ID
 */
const get = async (req, res) => {
  try {
    const [developerId] = req.params.developerId;
    const result = await developersDao.getDeveloperById(developerId);
    if (!result.data || !result.data.length) {
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
    const { id } = req.params;
    const result = await developersDao.deleteDeveloper(id);
    res.send(result);
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/developers/{developerId}'].get;

module.exports = { get, del };
