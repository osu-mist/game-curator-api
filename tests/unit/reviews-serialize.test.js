/* eslint no-unused-vars: 0 */

const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

const reviewsSerializer = appRoot.require('api/v1/serializers/reviews-serializer');
const { getDefinitionProps, testSingleResource, testMultipleResources } = appRoot.require('tests/unit/serializer-test-helpers.js');
const testData = appRoot.require('tests/unit/test-data');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test reviews-serializer', () => {
  const { rawReviews } = testData;
  const resourceType = 'review';

  it('test serializeGame', () => {
    const { serializeReview } = reviewsSerializer;

    const serializedReview = serializeReview(rawReviews[0]);
    testSingleResource(serializedReview, resourceType, _.omit(rawReviews[0], ['id']));
  });

  it('test serializeReviews', () => {
    const { serializeReviews } = reviewsSerializer;

    const serializedReviews = serializeReviews(rawReviews, testData.paginationQueries);
    testMultipleResources(serializedReviews);

    expect(serializedReviews).to.have.all.keys(_.keys(getDefinitionProps('ReviewResults')));
  });
});
