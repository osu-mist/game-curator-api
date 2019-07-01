const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { paginate } = appRoot.require('utils/paginator');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const developerResourceProp = openapi.definitions.DeveloperResource.properties;
const developerResourceType = developerResourceProp.type.enum[0];
const developerResourceKeys = _.keys(developerResourceProp.attributes.properties);
const developerResourcePath = 'developers';
const developerResourceUrl = resourcePathLink(apiBaseUrl, developerResourcePath);

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in openapi.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(developerResourceKeys, (key, index) => {
  developerResourceKeys[index] = decamelize(key).toUpperCase();
});

/**
 * @summary Serialize developerResources to JSON API
 * @function
 * @param {[Object]} rawdevelopers Raw data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized developerResources object
 */
const serializedevelopers = (rawDevelopers, query) => {
  /**
   * Add pagination links and meta information to options if pagination is enabled
   */
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  const pagination = paginate(rawDevelopers, pageQuery);
  pagination.totalResults = rawDevelopers.length;
  rawDevelopers = pagination.paginatedRows;

  const topLevelSelfLink = paramsLink(developerResourceUrl, query);
  const serializerArgs = {
    identifierField: 'ID',
    resourceKeys: developerResourceKeys,
    pagination,
    resourcePath: developerResourcePath,
    topLevelSelfLink,
    query: _.omit(query, 'page[size]', 'page[number]'),
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    developerResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawDevelopers);
};

/**
 * @summary Serialize developerResource to JSON API
 * @function
 * @param {Object} rawDeveloper Raw data row from data source
 * @returns {Object} Serialized developerResource object
 */
const serializeDeveloper = (rawDeveloper) => {
  const topLevelSelfLink = resourcePathLink(developerResourceUrl, rawDeveloper.ID);
  const serializerArgs = {
    identifierField: 'ID',
    resourceKeys: developerResourceKeys,
    resourcePath: developerResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    developerResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawDeveloper);
};
module.exports = { serializeDevelopers, serializeDeveloper };
