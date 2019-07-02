const appRoot = require('app-root-path');
const config = require('config');
const _ = require('lodash');

const { serializeDevelopers, serializeDeveloper } = require('../../serializers/developers-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');

const { endpointUri } = config.get('server');

/**
 * @summary Return a list of developers
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of developers
 */
const getDevelopers = async () => {
  const connection = await conn.getConnection();
  const sqlQuery = 'SELECT ID, NAME, WEBSITE FROM DEVELOPERS';
  try {
    const rawDevelopersReponse = await connection.execute(sqlQuery);
    const rawDevelopers = rawDevelopersReponse.rows;
    const serializedDevelopers = serializeDevelopers(rawDevelopers, endpointUri);
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
  // TODO
  const connection = await conn.getConnection();
  try {
    const sqlParams = {
      ID: id,
    };
    const { rawDevelopers } = await connection.execute('select id from DEVELOPERS WHERE ID = :ID', sqlParams);

    if (_.isEmpty(rawDevelopers)) {
      return undefined;
    }
    if (rawDevelopers.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const [rawDeveloper] = rawDevelopers;
      const serializedDeveloper = serializeDeveloper(rawDeveloper);
      return serializedDeveloper;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getDevelopers, getDeveloperById };
