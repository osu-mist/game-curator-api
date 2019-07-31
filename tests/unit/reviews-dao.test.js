const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

let reviewsDao;
const reviewsSerializer = appRoot.require('api/v1/serializers/reviews-serializer');
const testData = require('./test-data');
const { createConnStub } = require('./test-helpers');

chai.should();
chai.use(chaiAsPromised);

describe('Test reviews-dao', () => {
  const { fakeId, fakeBody } = testData;

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

  describe('Test getReviews', () => {
    const testCases = [
      { testCase: [{}, {}], description: 'multiple results' },
      { testCase: [{}], description: 'a single result' },
    ];
    _.forEach(testCases, ({ testCase, description }) => {
      it(`getReviews should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });

        const result = reviewsDao.getReviews('fakeQueries');
        return result.should
          .eventually.be.fulfilled
          .and.deep.equals(testCase);
      });
    });

    it('getReviews should be rejected when an undefined or improper queries are passed in', () => {
      createConnStub();

      const expectedError = 'Cannot read property \'gameIds\' of undefined';
      // explicitly pass in undefined
      const result = reviewsDao.getReviews(undefined);
      return result.should.eventually.be.rejectedWith(Error, expectedError);
    });
  });

  describe('Test getReviewById', () => {
    it('getReviewById should be fulfilled with a single result', () => {
      const testCases = [
        { testCase: [{}], expectedResult: {} },
      ];

      const fulfilledPromises = [];
      _.forEach(testCases, ({ testCase, expectedResult }) => {
        const connStub = createConnStub({ rows: testCase });

        const result = reviewsDao.getReviewById(fakeId);
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
  });

  describe('Test postReview', () => {
    it('postReview should be fulfilled with a single result', () => {
      const testCase = [{}];
      createConnStub({ rows: testCase, outBinds: { outId: [1] } });

      const result = reviewsDao.postReview(fakeBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal(testCase[0]);
    });

    const testCases = [
      {
        badBody: undefined,
        error: 'Cannot read property \'data\' of undefined',
        description: 'no data is passed in the body',
      },
      {
        badBody: { attributes: {} },
        error: 'Cannot destructure property `attributes` of \'undefined\' or \'null\'.',
        description: 'attributes is passed in the body without the required fields',
      },
    ];
    _.forEach(testCases, ({ badBody, error, description }) => {
      it(`postReview should be rejected when ${description}`, () => {
        createConnStub({});

        const result = reviewsDao.postReview(badBody);
        return result.should
          .eventually.be.rejectedWith(Error, error);
      });
    });
  });

  describe('Test deleteReview', () => {
    const testCases = [
      { testCase: [{}], description: 'a single result' },
      { testCase: { rowsAffected: 0 }, description: '0 rowsAffected' },
    ];
    _.forEach(testCases, ({ testCase, description }) => {
      it(`deleteReview should be fulfilled with ${description}`, () => {
        createConnStub(testCase);

        const result = reviewsDao.deleteReview();
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(testCase);
      });
    });
  });

  describe('Test patchReview', () => {
    let testCases = [
      { testCase: [{}], description: 'a single result' },
      { testCase: { rowsAffected: 0 }, description: '0 rowsAffected' },
    ];
    _.forEach(testCases, ({ testCase, description }) => {
      it(`patchReview should be fulfilled with ${description}`, () => {
        createConnStub(testCase);

        const result = reviewsDao.patchReview(fakeId, fakeBody);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(testCase);
      });
    });

    testCases = [
      {
        badBody: undefined,
        error: 'Cannot read property \'data\' of undefined',
        description: 'an undefined body is passed in',
      },
      {
        badBody: { attributes: {} },
        error: 'Cannot destructure property `attributes` of \'undefined\' or \'null\'.',
        description: 'a body with attributes that are missing required fields is passed in',
      },
    ];
    _.forEach(testCases, ({ badBody, error, description }) => {
      it(`patchReview should be rejected when ${description}`, () => {
        createConnStub();

        const result = reviewsDao.patchReview(fakeId, badBody);
        return result.should
          .eventually.be.rejectedWith(Error, error);
      });
    });
  });

  describe('Test isValidGame', () => {
    const testCases = [
      {
        testCase: { rows: [{ id: 1 }] },
        expectedResult: true,
        description: 'true when the id field returned is 1',
      },
      {
        testCase: { rows: [{ id: 0 }] },
        expectedResult: false,
        description: 'false when id field returned is 0',
      },
    ];
    _.forEach(testCases, ({ testCase, expectedResult, description }) => {
      it(`isValidGame should be fulfilled ${description}`, () => {
        createConnStub(testCase);

        const result = reviewsDao.isValidGame();
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });

    it('isValidGame should be rejected when a single response is returned', () => {
      createConnStub({});
      const result = reviewsDao.isValidGame(fakeId);
      return result.should.be.rejectedWith(Error, 'Cannot read property \'0\' of undefined');
    });
  });
});
