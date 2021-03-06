const appRoot = require('app-root-path');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { paginate } = appRoot.require('utils/paginator');
const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');

const reviewResourceProp = openapi.definitions.ReviewResource.properties;
const reviewResourceType = reviewResourceProp.type.enum[0];
const reviewResourceKeys = _.keys(reviewResourceProp.attributes.properties);
const reviewResourcePath = 'reviews';
const reviewResourceUrl = resourcePathLink(apiBaseUrl, reviewResourcePath);

/**
 * @summary Converts raw review data from db into types defined by the openapi
 */
const reviewConverter = (reviews) => {
  _.forEach(reviews, (review) => {
    review.score = parseFloat(review.score);
    const date = new Date(review.reviewDate);
    review.reviewDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  });
};

/**
 * @summary Serialize reviewResources to JSON API
 * @function
 * @param {object[]} rawReviews Raw data rows from data source
 * @param {object} query Query parameters
 * @returns {object} Serialized reviewResources object
 */
const serializeReviews = (rawReviews, query) => {
  reviewConverter(rawReviews);

  /**
   * Add pagination links and meta information to options if pagination is enabled
   */
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  const pagination = paginate(rawReviews, pageQuery);
  pagination.totalResults = rawReviews.length;
  rawReviews = pagination.paginatedRows;

  const topLevelSelfLink = paramsLink(reviewResourceUrl, query);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: reviewResourceKeys,
    pagination,
    resourcePath: reviewResourcePath,
    topLevelSelfLink,
    query: _.omit(query, 'page[size]', 'page[number]'),
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    reviewResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawReviews);
};

/**
 * @summary Serialize reviewResource to JSON API
 * @function
 * @param {object} rawReview Raw data row from data source
 * @returns {object} Serialized reviewResource object
 */
const serializeReview = (rawReview) => {
  reviewConverter([rawReview]);

  const topLevelSelfLink = resourcePathLink(reviewResourceUrl, rawReview.id);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: reviewResourceKeys,
    resourcePath: reviewResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    reviewResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawReview);
};
module.exports = { serializeReviews, serializeReview, reviewConverter };
