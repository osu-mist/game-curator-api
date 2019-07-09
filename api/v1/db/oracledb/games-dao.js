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
  const sqlParams = {};
  if (queries.name) {
    sqlParams.name = queries.name;
  }
  const sqlQuery = 'TODO';
  try {
    const { rows } = await connection.execute(sqlQuery, sqlParams);
    const serializedGames = serializeGames(rows, queries);
    return serializedGames;
  } finally {
    connection.close();
  }
};

module.exports = { getGames };
