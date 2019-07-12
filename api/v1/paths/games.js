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
    const { developerId } = req.body.data.attributes;
    if (!Number.isNaN(developerId) && !Number.isInteger(parseFloat(developerId))) {
      errorBuilder(res, 400, ['developerId must be a string containing a valid integer']);
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
