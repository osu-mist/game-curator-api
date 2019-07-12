const appRoot = require('app-root-path');
const _ = require('lodash');
const oracledb = require('oracledb');

const { serializeReview, serializeReviews } = require('../../serializers/reviews-serializer');

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

/**
 * @summary Return a specific review by unique ID
 * @function
 * @param {string} id Unique review ID
 * @returns {Promise<Object>} Promise object represents a specific review or return undefined if
 *                            term is not found
 */
const getReviewById = async (id) => {
  const sqlParams = {
    reviewId: id,
  };
  const sqlQuery = `
    SELECT ID AS "id",
    REVIEWER AS "reviewer",
    GAME_ID AS "gameId",
    SCORE AS "score",
    REVIEW_TEXT AS "reviewText",
    REVIEW_DATE AS "reviewDate"
    FROM REVIEWS
    WHERE ID = :reviewId
  `;

  const connection = await conn.getConnection();
  try {
    const { rows } = await connection.execute(sqlQuery, sqlParams);

    if (rows.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else if (_.isEmpty(rows)) {
      return undefined;
    } else {
      const serializedReview = serializeReview(rows[0]);
      return serializedReview;
    }
  } finally {
    connection.close();
  }
};

/**
 * @summary Create review record
 */
const postReview = async (body) => {
  const connection = await conn.getConnection();
  try {
    const { attributes } = body.data;
    attributes.outId = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };
    const sqlQuery = `
      INSERT INTO REVIEWS
      (REVIEWER, REVIEW_TEXT, SCORE, GAME_ID)
      VALUES (:reviewer, :reviewText, :score, :gameId)
      RETURNING ID INTO :outId
    `;
    const rawReviews = await connection.execute(sqlQuery, attributes, { autoCommit: true });

    const result = await getReviewById(rawReviews.outBinds.outId[0]);
    return result;
  } finally {
    connection.close();
  }
};

/**
 * @summary Delete review record
 */
const deleteReview = async (reviewId) => {
  const sqlParams = { id: reviewId };
  const sqlQuery = 'DELETE FROM REVIEWS WHERE ID = :id';

  const connection = await conn.getConnection();
  try {
    const response = await connection.execute(sqlQuery, sqlParams, { autoCommit: true });
    return response;
  } finally {
    connection.close();
  }
};

module.exports = {
  getReviews, getReviewById, postReview, deleteReview,
};
