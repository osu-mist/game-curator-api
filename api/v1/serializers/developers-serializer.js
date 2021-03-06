const appRoot = require('app-root-path');
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
 * @summary Serialize developerResources to JSON API
 * @function
 * @param {[object]} rawdevelopers Raw data rows from data source
 * @param {object} query Query parameters
 * @returns {object} Serialized developerResources object
 */
const serializeDevelopers = (rawDevelopers, query) => {
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
    identifierField: 'id',
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
 * @param {object} rawDeveloper Raw data row from data source
 * @returns {object} Serialized developerResource object
 */
const serializeDeveloper = (rawDeveloper) => {
  const topLevelSelfLink = resourcePathLink(developerResourceUrl, rawDeveloper.id);
  const serializerArgs = {
    identifierField: 'id',
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
