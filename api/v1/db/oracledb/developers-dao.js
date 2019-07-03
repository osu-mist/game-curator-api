const appRoot = require('app-root-path');
const config = require('config');
// const _ = require('lodash');

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
  const connection = await conn.getConnection();
  try {
    const sqlParams = {
      ID: id,
    };
    const sqlQuery = 'SELECT ID, NAME, WEBSITE FROM DEVELOPERS WHERE ID = :ID';
    const rawDevelopers = await connection.execute(sqlQuery, sqlParams);

    if (rawDevelopers.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const serializedDeveloper = serializeDeveloper(rawDevelopers.rows);
      return serializedDeveloper;
    }
  } finally {
    connection.close();
  }
};

const postDeveloper = async (body) => {
  const connection = await conn.getConnection();

  // console.log(Object.keys(body)[0]);
  const { attributes } = JSON.parse(Object.keys(body)[0]).data;
  // const { name, website } = attributes;
  console.log(attributes);
  const sqlQuery = 'INSERT INTO DEVELOPERS (NAME, WEBSITE) VALUES (:name, :website)';
  const sqlParams = attributes;

  const rawDevelopers = await connection.execute(sqlQuery, sqlParams);
  console.log(rawDevelopers);
};

module.exports = { getDevelopers, getDeveloperById, postDeveloper };
