const appRoot = require('app-root-path');

const { serializeGames } = require('../../serializers/games-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Return a list of games
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of games
 */
const getGames = async (queries) => {
  const connection = await conn.getConnection();
  const sqlQuery = 'SELECT ID AS "id", DEVELOPER_ID AS "developerId", NAME AS "name", SCORE AS "score", RELEASE_DATE AS "releaseDate" FROM VIDEO_GAMES';
  try {
    const { rows } = await connection.execute(sqlQuery);
    const serializedGames = serializeGames(rows, queries);
    return serializedGames;
  } finally {
    connection.close();
  }
};

module.exports = { getGames };
