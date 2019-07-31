const appRoot = require('app-root-path');
const _ = require('lodash');
const oracledb = require('oracledb');

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
    } else if (_.isEmpty(rows)) {
      return undefined;
    } else {
      const serializedDeveloper = serializeDeveloper(rows[0]);
      return serializedDeveloper;
    }
  } finally {
    connection.close();
  }
};

/**
 * @summary Inserts row into the developer table
 */
const postDeveloper = async (body) => {
  const connection = await conn.getConnection();

  try {
    // Bind newly inserted developer row ID to outId
    // We can use outId to query the newly created row and return it
    const { attributes } = body.data;
    attributes.outId = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };
    const sqlQuery = 'INSERT INTO DEVELOPERS (NAME, WEBSITE) VALUES (:name, :website) RETURNING ID INTO :outId';
    const rawDevelopers = await connection.execute(sqlQuery, attributes, { autoCommit: true });

    // query the newly inserted row
    const result = await getDeveloperById(rawDevelopers.outBinds.outId[0]);

    return result;
  } finally {
    connection.close();
  }
};

/**
 * @summary Deletes developer row from db by ID
 * @function
 * @param {string} developerId Unique developer ID
 */
const deleteDeveloper = async (developerId) => {
  const connection = await conn.getConnection();

  try {
    const sqlQuery = 'DELETE FROM DEVELOPERS WHERE ID = :id';
    const sqlParams = { id: developerId };
    const response = await connection.execute(sqlQuery, sqlParams, { autoCommit: true });

    return response;
  } finally {
    connection.close();
  }
};

/**
 * @summary update a developer record
 */
const patchDeveloper = async (id, body) => {
  const connection = await conn.getConnection();
  try {
    const { attributes } = body.data;
    attributes.id = id;
    const sqlQuery = 'UPDATE DEVELOPERS SET NAME = :name, WEBSITE = :website WHERE ID = :id';
    const response = await connection.execute(sqlQuery, attributes, { autoCommit: true });

    return response;
  } finally {
    connection.close();
  }
};

module.exports = {
  getDevelopers, getDeveloperById, postDeveloper, deleteDeveloper, patchDeveloper,
};
