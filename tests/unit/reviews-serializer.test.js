const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiMatch = require('chai-match');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

const reviewsSerializer = appRoot.require('api/v1/serializers/reviews-serializer');
const { getDefinitionProps, testSingleResource, testMultipleResources } = require('./test-helpers.js');
const testData = require('./test-data');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiMatch);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test reviews-serializer', () => {
  const { rawReviews } = testData;
  const resourceType = 'review';

  it('serializeReview should form a single JSON result as defined in openapi', () => {
    const { serializeReview } = reviewsSerializer;

    const serializedReview = serializeReview(rawReviews[0]);
    testSingleResource(serializedReview, resourceType, _.omit(rawReviews[0], ['id']));
  });

  it('serializeReviews should form a multiple JSON result as defined in openapi', () => {
    const { serializeReviews } = reviewsSerializer;

    const serializedReviews = serializeReviews(rawReviews, testData.paginationQueries);
    testMultipleResources(serializedReviews);

    expect(serializedReviews).to.have.all.keys(_.keys(getDefinitionProps('ReviewResults')));
  });

  it(`serializeReviews should be rejected when
      1. data is passed without queries
      2. queries are passed without data`, () => {
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

  it(`reviewConverter should convert score values from string to number
      and reviewDate values to yyyy-mm-dd date formats`, () => {
    const { reviewConverter } = reviewsSerializer;
    // rawReviews from testData is modified by the other tests
    // this test needs its own data so it can be tested in isolation from the others
    const { reviewConverterData } = testData;

    const testResults = [];
    _.forEach(reviewConverterData, (review) => {
      testResults.push(review.score.should
        .be.a('string', 'rawReview score should initially be a string'));
    });

    reviewConverter(reviewConverterData);

    _.forEach(reviewConverterData, (review) => {
      testResults.push(review.score.should
        .be.a('number', 'rawReviews score should be a number'));
      testResults.push(expect(review.reviewDate)
        .to.match(/^(\d{4}-([1-9]|1[0-2])-([1-9]|[12]\d|3[01]))$/));
    });
    return Promise.all(testResults);
  });
});
