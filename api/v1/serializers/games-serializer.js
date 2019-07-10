const appRoot = require('app-root-path');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { paginate } = appRoot.require('utils/paginator');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const gameResourceProp = openapi.definitions.GameResource.properties;
const gameResourceType = gameResourceProp.type.enum[0];
const gameResourceKeys = _.keys(gameResourceProp.attributes.properties);
const gameResourcePath = 'games';
const gameResourceUrl = resourcePathLink(apiBaseUrl, gameResourcePath);

/**
 * @summary Converts raw game data from db into types defined by the openapi
 */
const gameConverter = (games) => {
  _.forEach(games, (game) => {
    // convert score to float
    game.score = parseFloat(game.score);

    // convert db date format to mm/dd/yyyy format specified in openapi
    const date = new Date(game.releaseDate);
    game.releaseDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });
};

/**
 * @summary Serialize gameResources to JSON API
 * @function
 * @param {[Object]} rawGames Raw data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized gameResources object
 */
const serializeGames = (rawGames, query) => {
  gameConverter(rawGames);

  /**
   * Add pagination links and meta information to options if pagination is enabled
   */
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  const pagination = paginate(rawGames, pageQuery);
  pagination.totalResults = rawGames.length;
  rawGames = pagination.paginatedRows;

  const topLevelSelfLink = paramsLink(gameResourceUrl, query);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: gameResourceKeys,
    pagination,
    resourcePath: gameResourcePath,
    topLevelSelfLink,
    query: _.omit(query, 'page[size]', 'page[number]'),
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    gameResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawGames);
};

/**
 * @summary Serialize gameResource to JSON API
 * @function
 * @param {Object} rawGame Raw data row from data source
 * @returns {Object} Serialized gameResource object
 */
const serializeGame = (rawGame) => {
  gameConverter(rawGame);

  const topLevelSelfLink = resourcePathLink(gameResourceUrl, rawGame.id);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: gameResourceKeys,
    resourcePath: gameResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    gameResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawGame);
};
module.exports = { serializeGames, serializeGame };
