const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const developersDao = appRoot.require('api/v1/db/oracledb/developers-dao');

chai.should();
chai.use(chaiAsPromised);

describe('Test the test thing', () => {
  console.log('This test is running');
  const stubDevelopersSerializer = sinon.stub().returnsArg(0);
  const fakeId = 'fakeId';
  const fakeParams = {};

  sinon.stub(conn, 'getConnection').resolves({
    execute: (sql) => {
      const sqlResults = {
        multiResults: { rows: [{}, {}] },
        singleResults: { rows: [{}] },
      };
      return sql in sqlResults ? sqlResults[sql] : sqlResults.singleResults;
    },
    close: () => null,
  });

  it(`should be fulfilled if
        1. figure this out`, () => {
    const fulfilledCases = [
      { fakeSql: () => 'singleResult', isSingleton: true, expectResult: {} },
      { fakeSql: () => 'singleResult', isSingleton: false, expectResult: [{}] },
      { fakeSql: () => 'multiResult', isSingleton: false, expectResult: [{}, {}] },
    ];

    const fulfilledPromises = [];
    _.each(fulfilledCases, ({ fakeSql, isSingleton, expectResult }) => {
      const result = developersDao.getDeveloperById(
        fakeId, fakeSql, stubDevelopersSerializer, isSingleton, fakeParams,
      );
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectResult)
        .then(() => {
          sinon.assert.alwaysCalledWithExactly(stubDevelopersSerializer, any, any, fakeParams);
          sinon.assert.callCount(stubDevelopersSerializer, fulfilledCases.length);
        }));
    });
    return Promise.all(fulfilledPromises);
  });
});
