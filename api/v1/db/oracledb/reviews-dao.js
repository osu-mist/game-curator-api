const appRoot = require('app-root-path');
const _ = require('lodash');

const { serializeReviews } = require('../../serializers/reviews-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Return a list of reviews
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of reviews
 */
const getReviews = async (queries) => {
  const sqlParams = {};
  let gameIdQuery = '(';
  if (queries.gameIds) {
    _.forEach(queries.gameIds, (id, index) => {
      sqlParams[`gameId${index}`] = id;
      gameIdQuery += `:gameId${index}`;
      if (index !== queries.gameIds.length - 1) {
        gameIdQuery += ', ';
      }
    });
    gameIdQuery += ')';
  }
  if (queries.reviewer) {
    sqlParams.reviewer = queries.reviewer;
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
    ${sqlParams.reviewer ? 'AND REVIEWER = :reviewer' : ''}
    ${sqlParams.gameId0 ? `AND GAME_ID IN ${gameIdQuery}` : ''}
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
