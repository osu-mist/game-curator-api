const appRoot = require('app-root-path');

const gamesDao = require('../../db/oracledb/games-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get game by unique ID
 */
const get = async (req, res) => {
  try {
    const { gameId } = req.params;
    const result = await gamesDao.getGameById(gameId);
    if (!result) {
      errorBuilder(res, 404, 'A game with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

/**
 * @summary Delete game by unique ID
 */
const del = async (req, res) => {
  try {
    const { gameId } = req.params;
    const result = await gamesDao.deleteGame(gameId);
    if (result.rowsAffected < 1) {
      errorBuilder(res, 404, 'A game with the specified ID was not found.');
    } else {
      // send 204 on successful delete
      res.sendStatus(204);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

/**
 * @summary Patch game by unique id
 */
const patch = async (req, res) => {
  try {
    const { gameId } = req.params;
    if (gameId !== req.body.data.id) {
      errorBuilder(res, 400, ['Game id in path does not match id in body.']);
    } else {
      const result = await gamesDao.patchGame(gameId, req.body);
      if (result.rowsAffected < 1) {
        errorBuilder(res, 404, 'A game with the specified ID was not found.');
      } else {
        const updatedResult = await gamesDao.getGameById(gameId);
        res.send(updatedResult);
      }
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/games/{gameId}'].get;
del.apiDoc = paths['/games/{gameId}'].del;
patch.apiDoc = paths['/games/{gameId}'].patch;

module.exports = { get, del, patch };
