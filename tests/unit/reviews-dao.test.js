const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const conn = appRoot.require('api/v1/db/oracledb/connection');
let reviewsDao;
const reviewsSerializer = appRoot.require('api/v1/serializers/reviews-serializer');

chai.should();
chai.use(chaiAsPromised);

describe('Test reviews-dao', () => {
  beforeEach(() => {
    const serializeReviewStub = sinon.stub(reviewsSerializer, 'serializeReview');
    const serializeReviewsStub = sinon.stub(reviewsSerializer, 'serializeReviews');
    serializeReviewStub.returnsArg(0);
    serializeReviewsStub.returnsArg(0);

    reviewsDao = proxyquire(`${appRoot}/api/v1/db/oracledb/reviews-dao`, {
      '../../serializers/reviews-serializer': {
        serializeReview: serializeReviewStub,
        serializeReviews: serializeReviewsStub,
      },
    });
  });
  afterEach(() => sinon.restore());

  const createConnStub = executeReturn => sinon.stub(conn, 'getConnection').resolves({
    execute: () => executeReturn,
    close: () => null,
  });

  it(`getReviews should be fulfilled with
        1. multiple results
        2. a single result`, () => {
    const testCases = [
      { testCase: [{}, {}] },
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

  it('getReviews should be rejected when an undefined or improper queries are passed in', () => {
    createConnStub();

    const expectedError = 'Cannot read property \'gameIds\' of undefined';
    // explicitly pass in undefined
    const result = reviewsDao.getReviews(undefined);
    return result.should.eventually.be.rejectedWith(Error, expectedError);
  });

  it('getReviewById should be fulfilled with a single result', () => {
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

  it('getReviewById should be rejected when multiple results are returned', () => {
    const testCases = [
      { testCase: { rows: [{}, {}] }, error: 'Expect a single object but got multiple results.' },
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

  it('postReview should be fulfilled with a single result', () => {
    const testCase = [{}];

    const fakeBody = {
      data: {
        attributes: {
          name: 'test',
        },
      },
    };

    createConnStub({ rows: testCase, outBinds: { outId: [1] } });

    const result = reviewsDao.postReview(fakeBody);
    return result.should
      .eventually.be.fulfilled
      .and.deep.equal(testCase[0]);
  });

  it(`postReview should be rejected when
        1. no data is passed in the body
        2. attributes is passed in the body without the required fields`, () => {
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

  it('deleteReview should be fulfilled with a single result', () => {
    const testCases = [
      { testCase: [{}] },
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

  it('patchReview should be fulfilled with a single result', () => {
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

  it(`patchReview should be rejected
      1. an undefined body is passed in
      2. a body with attributes that are missing required fields is passed in`, () => {
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

  it(`isValidGame should be fulfilled
      1. true when the id field returned is 1
      2. false when the id field returned is 0`, () => {
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

  it('isValidGame should be rejected when a single response is returned', () => {
    createConnStub({});
    const result = reviewsDao.isValidGame('fakeId');
    return result.should.be.rejectedWith(Error, 'Cannot read property \'0\' of undefined');
  });
});
