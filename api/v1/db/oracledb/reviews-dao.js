const appRoot = require('app-root-path');

const { serializeReviews } = require('../../serializers/reviews-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Return a list of reviews
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of reviews
 */
const getReviews = async (queries) => {
  // const sqlParams = {};
  const sqlQuery = `
    SELECT ID as "id",
    REVIEWER as "reviewer"
    FROM REVIEWS
  `;

  const connection = await conn.getConnection();
  try {
    // execute query and return results
    const { rows } = await connection.execute(sqlQuery);
    const serializedReviews = serializeReviews(rows, queries);
    return serializedReviews;
  } finally {
    connection.close();
  }
};

module.exports = { getReviews };
