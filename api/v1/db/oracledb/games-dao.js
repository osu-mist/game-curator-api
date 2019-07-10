const appRoot = require('app-root-path');
const oracledb = require('oracledb');
const _ = require('lodash');

const { serializeGame, serializeGames } = require('../../serializers/games-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Return a list of games
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of games
 */
const getGames = async (queries) => {
  // parse passed in parameters and construct query
  const sqlParams = {
    scoreMin: parseFloat(queries.scoreMin),
    scoreMax: parseFloat(queries.scoreMax),
  };
  if (queries.name) {
    sqlParams.name = queries.name;
  }
  if (queries.gameId) {
    sqlParams.gameId = queries.gameId;
  }
  const sqlQuery = `
    SELECT ID AS "id", DEVELOPER_ID AS "gameId", NAME AS "name", SCORE AS "score", RELEASE_DATE AS "releaseDate"
    FROM VIDEO_GAMES
    WHERE SCORE BETWEEN :scoreMin AND :scoreMax OR SCORE IS NULL
    ${sqlParams.name ? 'AND NAME = :name' : ''}
    ${sqlParams.gameId ? 'AND DEVELOPER_ID = :gameId' : ''}
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
      SELECT ID AS "id", DEVELOPER_ID AS "gameId", NAME AS "name",
      SCORE AS "score", RELEASE_DATE AS "releaseDate"
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

/**
 * @summary Inserts row into the game table
 */
const postGame = async (body) => {
  const connection = await conn.getConnection();

  try {
    // Bind newly inserted game row ID to outId
    // We can use outId to query the newly created row and return it
    const { attributes } = body.data;
    attributes.outId = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };
    const sqlQuery = 'INSERT INTO VIDEO_GAMES (NAME, RELEASE_DATE, DEVELOPER_ID) VALUES (:name, TO_DATE(:releaseDate, \'YYYY/MM/DD\'), :developerId) RETURNING ID INTO :outId';
    const rawGames = await connection.execute(sqlQuery, attributes, { autoCommit: true });

    // query the newly inserted row
    const result = await getGameById(rawGames.outBinds.outId[0]);

    return result;
  } finally {
    connection.close();
  }
};

module.exports = { getGames, getGameById, postGame };
