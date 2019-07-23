const appRoot = require('app-root-path');
const _ = require('lodash');
const oracledb = require('oracledb');

const gamesSerializer = require('../../serializers/games-serializer');

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
    const serializedGames = gamesSerializer.serializeGames(rows, queries);
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
      const serializedGame = gamesSerializer.serializeGame(rows[0]);
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
    const sqlQuery = `
      INSERT INTO VIDEO_GAMES (NAME, RELEASE_DATE, DEVELOPER_ID)
      VALUES (:name, TO_DATE(:releaseDate, 'YYYY/MM/DD'), :developerId)
      RETURNING ID INTO :outId
    `;
    const rawGames = await connection.execute(sqlQuery, attributes, { autoCommit: true });

    // query the newly inserted row
    const result = await getGameById(rawGames.outBinds.outId[0]);

    return result;
  } finally {
    connection.close();
  }
};

/**
 * @summary Deletes game row from db by ID
 * @function
 * @param {string} gameId Unique game ID
 */
const deleteGame = async (gameId) => {
  const connection = await conn.getConnection();

  try {
    const sqlQuery = 'DELETE FROM VIDEO_GAMES WHERE ID = :id';
    const sqlParams = { id: gameId };
    const response = await connection.execute(sqlQuery, sqlParams, { autoCommit: true });

    return response;
  } finally {
    connection.close();
  }
};

/**
 * @summary update a game record
 */
const patchGame = async (id, body) => {
  const connection = await conn.getConnection();
  try {
    const { attributes } = body.data;
    attributes.id = id;
    const sqlQuery = `
      UPDATE VIDEO_GAMES
      SET ${attributes.name ? 'NAME = :name' : ''}
      ${attributes.releaseDate ? `${attributes.name ? ', ' : ''} RELEASE_DATE = TO_DATE(:releaseDate, 'YYYY/MM/DD')` : ''}
      WHERE ID = :id
    `;
    const response = await connection.execute(sqlQuery, attributes, { autoCommit: true });

    return response;
  } finally {
    connection.close();
  }
};

/**
 * @summary Checks if a developer record with an id that matches the passed in developerId exists
 * @param {string} developerId id of developer record to check existance
 * @returns {boolean} true if developer record is found and false if no records are found
 */
const isValidDeveloper = async (developerId) => {
  const sqlParams = { id: developerId };
  const sqlQuery = `
    SELECT COUNT(ID) AS "id"
    FROM DEVELOPERS
    WHERE ID = :id
  `;

  const connection = await conn.getConnection();
  try {
    const response = await connection.execute(sqlQuery, sqlParams);
    return response.rows[0].id > 0;
  } finally {
    connection.close();
  }
};

module.exports = {
  getGames,
  getGameById,
  postGame,
  isValidDeveloper,
  deleteGame,
  patchGame,
};
