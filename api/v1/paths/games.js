const appRoot = require('app-root-path');

const gamesDao = require('../db/oracledb/games-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get games
 */
const get = async (req, res) => {
  try {
    const result = await gamesDao.getGames(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary Create a game record via post
 */
const post = async (req, res) => {
  try {
    if (!await gamesDao.isValidDeveloper(req.body.data.attributes.developerId)) {
      errorBuilder(res, 400, ['A developer with developerId does not exist.']);
    } else {
      const result = await gamesDao.postGame(req.body);
      res.status(201).send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/games'].get;

module.exports = { get, post };
