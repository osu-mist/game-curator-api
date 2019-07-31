const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

let gamesDao;
const gamesSerializer = appRoot.require('api/v1/serializers/games-serializer');
const testData = require('./test-data');
const { createConnStub } = require('./test-helpers');

chai.should();
chai.use(chaiAsPromised);

describe('Test games-dao', () => {
  const { fakeId, fakeBody } = testData;

  beforeEach(() => {
    const serializeGameStub = sinon.stub(gamesSerializer, 'serializeGame');
    const serializeGamesStub = sinon.stub(gamesSerializer, 'serializeGames');
    serializeGameStub.returnsArg(0);
    serializeGamesStub.returnsArg(0);

    gamesDao = proxyquire(`${appRoot}/api/v1/db/oracledb/games-dao`, {
      '../../serializers/developers-serializer': {
        serializeGame: serializeGameStub,
        serializeGames: serializeGamesStub,
      },
    });
  });
  afterEach(() => sinon.restore());

  describe('Test getGames', () => {
    const testCases = [
      { testCase: [{}, {}], description: 'multiple results are returned' },
      { testCase: [{}], description: 'a single result is returned' },
    ];
    _.forEach(testCases, ({ testCase, description }) => {
      it(`getGames should be fulfilled when ${description}`, () => {
        createConnStub({ rows: testCase });

        const result = gamesDao.getGames(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equals(testCase);
      });
    });

    it('getGames should be rejected when improper query params are passed in', () => {
      createConnStub();

      const expectedError = 'Cannot read property \'page[number]\' of undefined';
      // explicitly pass in undefined
      const result = gamesDao.getGames(undefined);
      return result.should.eventually.be.rejectedWith(Error, expectedError);
    });
  });

  describe('Test getGameById', () => {
    it('getGameById should be fulfilled with a single result', () => {
      const testCases = [
        { testCase: [{}], expectedResult: {} },
      ];

      const fulfilledPromises = [];
      _.forEach(testCases, ({ testCase, expectedResult }) => {
        const connStub = createConnStub({ rows: testCase });

        const result = gamesDao.getGameById(fakeId);
        fulfilledPromises.push(result.should
          .eventually.be.fulfilled
          .and.deep.equals(expectedResult));

        connStub.restore();
      });

      return Promise.all(fulfilledPromises);
    });

    it('getGameById should be rejected when multiple results are returned', () => {
      const testCases = [
        { testCase: { rows: [{}, {}] }, error: 'Expect a single object but got multiple results.' },
      ];

      const rejectedPromises = [];
      _.forEach(testCases, ({ testCase, error }) => {
        const connStub = createConnStub(testCase);

        const result = gamesDao.getGameById();
        rejectedPromises.push(result.should.eventually.be.rejectedWith(Error, error));

        connStub.restore();
      });
      return Promise.all(rejectedPromises);
    });
  });

  describe('Test postGame', () => {
    it('postGame should be fulfilled with a single result', () => {
      const testCase = [{}];
      createConnStub({ rows: testCase, outBinds: { outId: [1] } });
      const result = gamesDao.postGame(fakeBody);
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
      it(`postGame should be rejected when ${description}`, () => {
        createConnStub({});

        const result = gamesDao.postGame(badBody);
        return result.should
          .eventually.be.rejectedWith(Error, error);
      });
    });
  });

  describe('Test deleteGame', () => {
    it('deleteGame should be fulfilled with single result', () => {
      const testCases = [
        { testCase: [{}] },
      ];

      const fulfilledPromises = [];
      _.forEach(testCases, ({ testCase }) => {
        const connStub = createConnStub(testCase);

        const result = gamesDao.deleteGame();
        fulfilledPromises.push(result.should
          .eventually.be.fulfilled
          .and.deep.equal(testCase));

        connStub.restore();
      });
      return Promise.all(fulfilledPromises);
    });
  });

  describe('Test patchGame', () => {
    it('patchGame should be fulfilled with a single result', () => {
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

        const result = gamesDao.patchGame(fakeId, fakeBody);
        fulfilledPromises.push(result.should
          .eventually.be.fulfilled
          .and.deep.equal(testCase));

        connStub.restore();
      });
      return Promise.all(fulfilledPromises);
    });

    const testCases = [
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
      it(`patchGame should be rejected when ${description}`, () => {
        createConnStub();
        const result = gamesDao.patchGame(fakeId, badBody);
        return result.should
          .eventually.be.rejectedWith(Error, error);
      });
    });
  });

  describe('Test isValidDeveloper', () => {
    const testCases = [
      {
        testCase: { rows: [{ id: 1 }] },
        expectedResult: true,
        description: 'true when the id field returned is 1',
      },
      {
        testCase: { rows: [{ id: 0 }] },
        expectedResult: false,
        description: 'false when the id field returned is 0',
      },
    ];
    _.forEach(testCases, ({ testCase, expectedResult, description }) => {
      it(`isValidDeveloper should be fulfilled return ${description}`, () => {
        createConnStub(testCase);
        const result = gamesDao.isValidDeveloper();
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });

    it('isValidDeveloper should be rejected when a single response is returned', () => {
      createConnStub({});
      const result = gamesDao.isValidDeveloper(fakeId);
      return result.should.be.rejectedWith(Error, 'Cannot read property \'0\' of undefined');
    });
  });
});
