const appRoot = require('app-root-path');

const { serializeReviews } = require('../../serializers/reviews-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Return a list of reviews
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of reviews
 */
const getReviews = async (queries) => {
  const sqlParams = {};
  if (queries.gameIds) {
    sqlParams.gameIds = queries.gameIds;
  }
  const sqlQuery = `
    SELECT ID AS "id",
    REVIEWER AS "reviewer",
    GAME_ID AS "gameId",
    SCORE AS "score",
    REVIEW_TEXT AS "reviewText",
    REVIEW_DATE AS "reviewDate"
    FROM REVIEWS
    WHERE 1=1
    ${sqlParams.gameIds ? 'AND GAME_ID IN :gameIds' : ''}
  `;

  const connection = await conn.getConnection();
  try {
    // execute query and return results
    const { rows } = await connection.execute(sqlQuery, sqlParams);
    const serializedReviews = serializeReviews(rows, queries);
    return serializedReviews;
  } finally {
    connection.close();
  }
};

module.exports = { getReviews };
