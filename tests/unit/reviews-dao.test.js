/* eslint no-unused-vars: 0 */

const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const sinon = require('sinon');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const reviewsDao = appRoot.require('api/v1/db/oracledb/reviews-dao');
const reviewsSerializer = appRoot.require('api/v1/serializers/reviews-serializer');

chai.should();
chai.use(chaiAsPromised);

describe('Test reviews-dao', () => {
  afterEach(() => sinon.restore());

  const createConnStub = executeReturn => sinon.stub(conn, 'getConnection').resolves({
    execute: () => executeReturn,
    close: () => null,
  });

  it('getReviews should be fulfilled', () => {
    sinon.stub(reviewsSerializer, 'serializeReviews').returnsArg(0);

    const testCases = [
      { testCase: [{}, {}] },
      { testCase: [] },
      { testCase: [{}] },
    ];

    const fulfilledPromises = [];
    _.forEach(testCases, ({ testCase }) => {
      const connStub = createConnStub({ rows: testCase });

      const result = reviewsDao.getReviews('fakeQueries');
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equals(testCase));

      connStub.restore();
    });
    return Promise.all(fulfilledPromises);
  });

  it('getReviews should be rejected', () => {
    sinon.stub(reviewsSerializer, 'serializeReviews').returnsArg(0);
    createConnStub();

    const expectedError = 'Cannot read property \'gameIds\' of undefined';
    // explicitly pass in undefined
    const result = reviewsDao.getReviews(undefined);
    return result.should.eventually.be.rejectedWith(Error, expectedError);
  });

  it('getReviewById should be fulfilled', () => {
    sinon.stub(reviewsSerializer, 'serializeReview').returnsArg(0);

    const testCases = [
      { testCase: [{}], expectedResult: {} },
    ];

    const fulfilledPromises = [];
    _.forEach(testCases, ({ testCase, expectedResult }) => {
      const connStub = createConnStub({ rows: testCase });

      const result = reviewsDao.getReviewById('fakeId');
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equals(expectedResult));

      connStub.restore();
    });
    return Promise.all(fulfilledPromises);
  });

  it('getReviewById should be rejected', () => {
    sinon.stub(reviewsSerializer, 'serializeReview').returnsArg(0);

    const testCases = [
      { testCase: { rows: [{}, {}] }, error: 'Expect a single object but got multiple results.' },
      { testCase: [], error: 'Cannot read property \'length\' of undefined' },
    ];

    const rejectedPromises = [];
    _.forEach(testCases, ({ testCase, error }) => {
      const connStub = createConnStub(testCase);

      const result = reviewsDao.getReviewById();
      rejectedPromises.push(result.should.eventually.be.rejectedWith(Error, error));

      connStub.restore();
    });
    return Promise.all(rejectedPromises);
  });

});
