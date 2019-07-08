const appRoot = require('app-root-path');

const { serializeDevelopers, serializeDeveloper } = require('../../serializers/developers-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Return a list of developers
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of developers
 */
const getDevelopers = async (queries) => {
  const connection = await conn.getConnection();
  const sqlParams = {};
  if (queries.name) {
    sqlParams.name = queries.name;
  }
  const sqlQuery = `
    SELECT ID AS "id", NAME AS "name", WEBSITE AS "website"
    FROM DEVELOPERS 
    ${sqlParams.name ? 'WHERE NAME = :name' : ''}
  `;
  try {
    const { rows } = await connection.execute(sqlQuery, sqlParams);
    const serializedDevelopers = serializeDevelopers(rows, queries);
    return serializedDevelopers;
  } finally {
    connection.close();
  }
};

/**
 * @summary Return a specific developer by unique ID
 * @function
 * @param {string} id Unique developer ID
 * @returns {Promise<Object>} Promise object represents a specific developer or return undefined if
 *                            term is not found
 */
const getDeveloperById = async (id) => {
  const connection = await conn.getConnection();
  try {
    const sqlParams = {
      developerId: id,
    };
    const sqlQuery = 'SELECT ID AS "id", NAME AS "name", WEBSITE AS "website" FROM DEVELOPERS WHERE ID = :developerId';
    const { rows } = await connection.execute(sqlQuery, sqlParams);

    if (rows.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const serializedDeveloper = serializeDeveloper(rows);
      return serializedDeveloper;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getDevelopers, getDeveloperById };
