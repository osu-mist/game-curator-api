const appRoot = require('app-root-path');
const _ = require('lodash');
const oracledb = require('oracledb');

const { serializeReview, serializeReviews } = require('../../serializers/reviews-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const { openapi } = appRoot.require('utils/load-openapi');

/**
 * @summary Return a list of reviews
 * @function
 * @returns {Promise<object[]>} Promise object represents a list of reviews
 */
const getReviews = async (queries) => {
  // get parameters accepted by this endpoint in openapi
  // filter params that should not be included in query
  // gameIds is special since the values are parsed directly into the query string
  const paramsToFilter = ['page[size]', 'page[number]', 'gameIds'];
  const acceptedParams = openapi.paths['/reviews'].get.parameters.map(x => x.name).filter(param => !paramsToFilter.includes(param));

  // pick parameters specified in openapi (getReviewsParameters) from passed in queries list
  const sqlParams = _.pick(queries, acceptedParams);

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
    ${queries.gameIds ? `AND GAME_ID IN (${queries.gameIds})` : ''}
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
 * @returns {Promise<object>} Promise object represents a specific review or return undefined if
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
  const { attributes } = body.data;
  attributes.outId = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };
  const sqlQuery = `
    INSERT INTO REVIEWS
    (REVIEWER, REVIEW_TEXT, SCORE, GAME_ID)
    VALUES (:reviewer, :reviewText, :score, :gameId)
    RETURNING ID INTO :outId
  `;

  const connection = await conn.getConnection();
  try {
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

/**
 * @summary update review record
 */
const patchReview = async (reviewId, body) => {
  const { attributes } = body.data;

  // setup text for the SET clause in the sql query
  const paramSet = [
    `${attributes.reviewText ? 'REVIEW_TEXT = :reviewText' : ''}`,
    `${attributes.score ? 'SCORE = :score' : ''}`,
    `${attributes.reviewer ? 'REVIEWER = :reviewer' : ''}`,
  ];
  // filter out empty strings ('') otherwise join adds trailing commas
  // '' is considered false
  const filteredParamSet = paramSet.filter(element => element);

  attributes.id = reviewId;
  const sqlQuery = `
    UPDATE REVIEWS
    SET ${filteredParamSet.join(', ')}
    WHERE ID = :id
  `;

  const connection = await conn.getConnection();
  try {
    const response = await connection.execute(sqlQuery, attributes, { autoCommit: true });
    return response;
  } finally {
    connection.close();
  }
};

/**
 * @summary Checks if the id (gameId) matches a record in the database
 * @function
 * @param {string} gameId Id of game to check for in database
 * @returns {boolean} true if at least one record is found, false if no records are found
 */
const isValidGame = async (gameId) => {
  const sqlParams = { id: gameId };
  const sqlQuery = `
    SELECT COUNT(ID) AS "id"
    FROM VIDEO_GAMES
    WHERE ID = :id
  `;

  const connection = await conn.getConnection();
  try {
    const result = await connection.execute(sqlQuery, sqlParams);

    return result.rows[0].id > 0;
  } finally {
    connection.close();
  }
};

module.exports = {
  getReviews,
  getReviewById,
  postReview,
  isValidGame,
  deleteReview,
  patchReview,
};
