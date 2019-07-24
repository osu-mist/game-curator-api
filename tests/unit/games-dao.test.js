/* eslint no-unused-vars: 0 */

const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');

// sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const gamesDao = appRoot.require('api/v1/db/oracledb/games-dao');
const gamesSerializer = appRoot.require('api/v1/serializers/games-serializer');

chai.should();
chai.use(chaiAsPromised);

describe('Test games-dao', () => {
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
    sinon.stub(gamesSerializer, 'serializeGames').returnsArg(0);

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
    sinon.stub(gamesSerializer, 'serializeGames').returnsArg(0);
    createConnStub();

    const expectedError = 'Cannot read property \'page[number]\' of undefined';
    // explicitly pass in undefined
    const result = gamesDao.getGames(undefined);
    return result.should.eventually.be.rejectedWith(Error, expectedError);
  });

  it('getGameById should be fulfilled', () => {
    sinon.stub(gamesSerializer, 'serializeGame').returnsArg(0);

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

  });
});
