const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const developersDao = appRoot.require('api/v1/db/oracledb/developers-dao');
// const developersSerializer = appRoot.require('api/v1/serializers/developers-serializer');

chai.should();
chai.use(chaiAsPromised);

describe('Test developers-dao', () => {
  const fakeId = 'fakeId';

  sinon.stub(conn, 'getConnection').resolves({
    execute: (sql) => {
      const sqlResults = {
        multiResults: { rows: [{}, {}] },
        singleResult: { rows: [{}] },
      };
      return sql in sqlResults ? sqlResults[sql] : sqlResults.singleResult;
    },
    close: () => null,
  });

  it(`should be fulfilled if
        1. figure this out`, () => {
    // causes tests to pass
    // sinon.stub(developersDao, 'getDeveloperById').returns({});
    // sinon.stub(developersSerializer, 'serializeDevelopers').returns({});

    const fulfilledCases = [
      { expectResult: {} },
    ];

    const fulfilledPromises = [];
    _.each(fulfilledCases, ({ expectResult }) => {
      const result = developersDao.getDeveloperById(
        fakeId,
      );
      fulfilledPromises.push(result.should.deep.equal(expectResult));
    });
    return Promise.all(fulfilledPromises);
  });

  /* it('getDevelopers should be rejected', async () => {
    const expectResult = {};

    sinon.stub(developersDao, 'getDevelopers').returns('multiResults');
    sinon.stub(developersSerializer, 'serializeDevelopers').returns(expectResult);
    const fulfilledResult = developersDao.getDevelopers();

    return fulfilledResult.should
      .eventually.be.fulfilled
      .and.deep.equal(expectResult);
  }); */
});
