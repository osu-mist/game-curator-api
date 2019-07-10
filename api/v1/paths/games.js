const appRoot = require('app-root-path');
const _ = require('lodash');

const gamesDao = require('../db/oracledb/games-dao');

const { errorHandler, errorBuilder } = appRoot.require('errors/errors');
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
    // 500 error will be thrown unless we check for an existing body
    if (_.isEmpty(req.body)) {
      errorBuilder(res, 400, ['No body in request']);
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
