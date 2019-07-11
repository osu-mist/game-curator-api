const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializeGame, serializeGames } = require('../../serializers/games-serializer');

const { openapi } = appRoot.require('utils/load-openapi');
const getParameters = openapi.paths['/games'].get.parameters;

const conn = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Return a list of games
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of games
 */
const getGames = async (queries) => {
  // parse passed in parameters and construct query
  const sqlParams = {};
  // iterate through parameters and add parameters in request to the sql query
  _.forEach(getParameters, (key) => {
    if (queries[key.name] && key.name !== 'page[size]' && key.name !== 'page[number]') {
      sqlParams[key.name] = queries[key.name];
    }
  });
  const sqlQuery = `
    SELECT ID AS "id",
    DEVELOPER_ID AS "developerId",
    NAME AS "name",
    SCORE AS "score",
    RELEASE_DATE AS "releaseDate"
    FROM VIDEO_GAMES
    WHERE 1=1
    ${sqlParams.scoreMin ? 'AND SCORE >= :scoreMin' : ''}
    ${sqlParams.scoreMax ? 'AND SCORE <= :scoreMax' : ''}
    ${sqlParams.name ? 'AND NAME = :name' : ''}
    ${sqlParams.developerId ? 'AND DEVELOPER_ID = :developerId' : ''}
  `;

  const connection = await conn.getConnection();
  try {
    // execute query and return results
    const { rows } = await connection.execute(sqlQuery, sqlParams);
    const serializedGames = serializeGames(rows, queries);
    return serializedGames;
  } finally {
    connection.close();
  }
};

/**
 * @summary Return a specific game by unique ID
 * @function
 * @param {string} id Unique game ID
 * @returns {Promise<Object>} Promise object represents a specific game or return undefined if
 *                            term is not found
 */
const getGameById = async (id) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = {
      gameId: id,
    };
    const sqlQuery = `
      SELECT ID AS "id",
      DEVELOPER_ID AS "developerId",
      NAME AS "name",
      SCORE AS "score",
      RELEASE_DATE AS "releaseDate"
      FROM VIDEO_GAMES
      WHERE ID = :gameId
    `;
    const { rows } = await connection.execute(sqlQuery, sqlParams);

    if (rows.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else if (_.isEmpty(rows)) {
      return undefined;
    } else {
      const serializedGame = serializeGame(rows[0]);
      return serializedGame;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getGames, getGameById };
