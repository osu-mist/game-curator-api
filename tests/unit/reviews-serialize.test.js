/* eslint no-unused-vars: 0 */

const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiMatch = require('chai-match');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

const reviewsSerializer = appRoot.require('api/v1/serializers/reviews-serializer');
const { getDefinitionProps, testSingleResource, testMultipleResources } = appRoot.require('tests/unit/serializer-test-helpers.js');
const testData = appRoot.require('tests/unit/test-data');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiMatch);
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

  it('serializeReviews should be rejected', () => {
    const { serializeReviews } = reviewsSerializer;
    const rejectedCases = [
      { rawData: rawReviews, queries: null, error: 'Cannot read property \'page[size]\' of null' },
      { rawData: null, queries: testData.paginationQueries, error: 'Cannot read property \'length\' of null' },
    ];

    const rejectedPromises = [];
    _.forEach(rejectedCases, ({ rawData, queries, error }) => {
      rejectedPromises.push(
        expect(() => serializeReviews(rawData, queries))
          .to.throw(error),
      );
    });
    return Promise.all(rejectedPromises);
  });

  it('test reviewConverter', () => {
    const { reviewConverter } = reviewsSerializer;

    // for some reason when the rawReview data is imported in
    // the string values for score are implicitly converted to numbers
    // a main purpose for reviewConvert is to do that conversion
    // we must convert back to string to properly test
    _.forEach(rawReviews, (review) => {
      review.score = String(review.score);
    });
    reviewConverter(rawReviews);

    const testResults = [];
    _.forEach(rawReviews, (review) => {
      testResults.push(review.score.should
        .be.a('number', 'rawReviews score should be a number'));
      testResults.push(expect(review.reviewDate)
        .to.match(/^(\d{4}-([1-9]|1[0-2])-([1-9]|[12]\d|3[01]))$/));
    });
    return Promise.all(testResults);
  });
});
