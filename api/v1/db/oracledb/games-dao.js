const appRoot = require('app-root-path');

const { serializeGames } = require('../../serializers/games-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Return a list of games
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of games
 */
const getGames = async (queries) => {
  // parse passed in parameters and construct query
  const sqlParams = {
    scoreMin: queries.scoreMin,
    scoreMax: queries.scoreMax,
  };
  if (queries.name) {
    sqlParams.name = queries.name;
  }
  if (queries.developerId) {
    sqlParams.developerId = queries.developerId;
  }
  const sqlQuery = `
    SELECT ID AS "id",
    DEVELOPER_ID AS "developerId",
    NAME AS "name",
    SCORE AS "score",
    RELEASE_DATE AS "releaseDate"
    FROM VIDEO_GAMES
    WHERE ((SCORE BETWEEN :scoreMin AND :scoreMax)
    ${sqlParams.scoreMin > 1 || sqlParams.scoreMax < 5 ? '' : 'OR SCORE IS NULL'})
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

module.exports = { getGames };
