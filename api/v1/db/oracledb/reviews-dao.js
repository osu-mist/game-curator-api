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

  // get parameters from query
  _.forEach(Object.keys(queries), (param) => {
    if (param !== 'gameIds' && param !== 'page[size]' && param !== 'page[number]') {
      sqlParams[param] = queries[param];
    }
  });

  // construct query
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
    ${queries.gameIds ? `AND GAME_ID IN (${queries.gameIds.join(', ')})` : ''}
    ${sqlParams.scoreMin ? 'AND SCORE >= :scoreMin' : ''}
    ${sqlParams.scoreMax ? 'AND SCORE <= :scoreMax' : ''}
    ${sqlParams.reviewDate ? 'AND TRUNC(REVIEW_DATE) = TO_DATE(:reviewDate, \'YYYY-MM-DD\')' : ''}
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
