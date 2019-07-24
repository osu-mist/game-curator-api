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

  it('postReview should be fulfilled', () => {
    // TODO
  });

  it('postReview should be rejected', () => {
    sinon.stub(reviewsSerializer, 'serializeReview').returnsArg(0);

    const testCases = [
      { fakeBody: undefined, error: 'Cannot read property \'data\' of undefined' },
      { fakeBody: { attributes: {} }, error: 'Cannot destructure property `attributes` of \'undefined\' or \'null\'.' },
    ];

    const rejectedPromises = [];
    _.forEach(testCases, ({ fakeBody, error }) => {
      const connStub = createConnStub({});

      const result = reviewsDao.postReview(fakeBody);
      rejectedPromises.push(result.should
        .eventually.be.rejectedWith(Error, error));

      connStub.restore();
    });
    return Promise.all(rejectedPromises);
  });

  it('deleteReview should be fulfilled', () => {
    const testCases = [
      { testCase: [] },
    ];

    const fulfilledPromises = [];
    _.forEach(testCases, ({ testCase }) => {
      const connStub = createConnStub(testCase);

      const result = reviewsDao.deleteReview();
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equal(testCase));

      connStub.restore();
    });
    return Promise.all(fulfilledPromises);
  });

  it('patchReview should be fulfilled', () => {
    const testCases = [
      { testCase: [{}] },
    ];

    const fakeId = 'fakeId';
    const fakeBody = {
      data: {
        attributes: [{}],
      },
    };

    const fulfilledPromises = [];
    _.forEach(testCases, ({ testCase }) => {
      const connStub = createConnStub(testCase);

      const result = reviewsDao.patchReview(fakeId, fakeBody);
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equal(testCase));

      connStub.restore();
    });
    return Promise.all(fulfilledPromises);
  });

  it('patchReview should be rejected', () => {
    const testCases = [
      { fakeBody: undefined, error: 'Cannot read property \'data\' of undefined' },
      { fakeBody: { attributes: {} }, error: 'Cannot destructure property `attributes` of \'undefined\' or \'null\'.' },
    ];
    const fakeId = 'fakeId';

    const rejectedPromises = [];
    _.forEach(testCases, ({ fakeBody, error }) => {
      const connStub = createConnStub();

      const result = reviewsDao.patchReview(fakeId, fakeBody);
      rejectedPromises.push(result.should
        .eventually.be.rejectedWith(Error, error));

      connStub.restore();
    });
    return Promise.all(rejectedPromises);
  });

  it('isValidGame should be fulfilled', () => {
    const testCases = [
      { testCase: { rows: [{ id: 1 }] }, expectedResult: true },
      { testCase: { rows: [{ id: 0 }] }, expectedResult: false },
    ];

    const fulfilledPromises = [];
    _.forEach(testCases, ({ testCase, expectedResult }) => {
      const connStub = createConnStub(testCase);

      const result = reviewsDao.isValidGame();
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult));

      connStub.restore();
    });
    return Promise.all(fulfilledPromises);
  });

  it('isValidGame should be rejected', () => {
    createConnStub({});
    const result = reviewsDao.isValidGame('fakeId');
    return result.should.be.rejectedWith(Error, 'Cannot read property \'0\' of undefined');
  });
});
