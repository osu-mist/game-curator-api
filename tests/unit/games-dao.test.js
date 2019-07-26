const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const conn = appRoot.require('api/v1/db/oracledb/connection');
let gamesDao;
const gamesSerializer = appRoot.require('api/v1/serializers/games-serializer');

chai.should();
chai.use(chaiAsPromised);

describe('Test games-dao', () => {
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

  const createConnStub = executeReturn => sinon.stub(conn, 'getConnection').resolves({
    execute: () => executeReturn,
    close: () => null,
  });

  it('getGames should be fulfilled', () => {
    const testCases = [
      { testCase: [{}, {}] },
      { testCase: [] },
      { testCase: [{}] },
    ];

    const fulfilledPromises = [];
    _.forEach(testCases, ({ testCase }) => {
      const connStub = createConnStub({ rows: testCase });

      const result = gamesDao.getGames('fakeId');
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equals(testCase));

      connStub.restore();
    });
    return Promise.all(fulfilledPromises);
  });

  it('getGames should be rejected', () => {
    createConnStub();

    const expectedError = 'Cannot read property \'page[number]\' of undefined';
    // explicitly pass in undefined
    const result = gamesDao.getGames(undefined);
    return result.should.eventually.be.rejectedWith(Error, expectedError);
  });

  it('getGameById should be fulfilled', () => {
    const testCases = [
      { testCase: [{}], expectedResult: {} },
    ];

    const fulfilledPromises = [];
    _.forEach(testCases, ({ testCase, expectedResult }) => {
      const connStub = createConnStub({ rows: testCase });

      const result = gamesDao.getGameById('fakeId');
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equals(expectedResult));

      connStub.restore();
    });

    return Promise.all(fulfilledPromises);
  });

  it('getGameById should be rejected', () => {
    const testCases = [
      { testCase: { rows: [{}, {}] }, error: 'Expect a single object but got multiple results.' },
      { testCase: [], error: 'Cannot read property \'length\' of undefined' },
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

  it('postGame should be fulfilled', () => {
    const testCase = [{}];

    const fakeBody = {
      data: {
        attributes: {
          name: 'test',
        },
      },
    };

    createConnStub({ rows: testCase, outBinds: { outId: [1] } });

    const result = gamesDao.postGame(fakeBody);
    return result.should
      .eventually.be.fulfilled
      .and.deep.equal(testCase[0]);
  });

  it('postGame should be rejected', () => {
    const testCases = [
      { fakeBody: undefined, error: 'Cannot read property \'data\' of undefined' },
      { fakeBody: { attributes: {} }, error: 'Cannot destructure property `attributes` of \'undefined\' or \'null\'.' },
    ];

    const rejectedPromises = [];
    _.forEach(testCases, ({ fakeBody, error }) => {
      const connStub = createConnStub({});

      const result = gamesDao.postGame(fakeBody);
      rejectedPromises.push(result.should
        .eventually.be.rejectedWith(Error, error));

      connStub.restore();
    });
    return Promise.all(rejectedPromises);
  });

  it('deleteGame should be fulfilled', () => {
    const testCases = [
      { testCase: [] },
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

  it('patchGame should be fulfilled', () => {
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

  it('patchGame should be rejected', () => {
    const testCases = [
      { fakeBody: undefined, error: 'Cannot read property \'data\' of undefined' },
      { fakeBody: { attributes: {} }, error: 'Cannot destructure property `attributes` of \'undefined\' or \'null\'.' },
    ];
    const fakeId = 'fakeId';

    const rejectedPromises = [];
    _.forEach(testCases, ({ fakeBody, error }) => {
      const connStub = createConnStub();

      const result = gamesDao.patchGame(fakeId, fakeBody);
      rejectedPromises.push(result.should
        .eventually.be.rejectedWith(Error, error));

      connStub.restore();
    });
    return Promise.all(rejectedPromises);
  });

  it('isValidDeveloper should be fulfilled', () => {
    const testCases = [
      { testCase: { rows: [{ id: 1 }] }, expectedResult: true },
      { testCase: { rows: [{ id: 0 }] }, expectedResult: false },
    ];

    const fulfilledPromises = [];
    _.forEach(testCases, ({ testCase, expectedResult }) => {
      const connStub = createConnStub(testCase);

      const result = gamesDao.isValidDeveloper();
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult));

      connStub.restore();
    });
    return Promise.all(fulfilledPromises);
  });

  it('isValidDeveloper should be rejected', () => {
    createConnStub({});
    const result = gamesDao.isValidDeveloper('fakeId');
    return result.should.be.rejectedWith(Error, 'Cannot read property \'0\' of undefined');
  });
});
