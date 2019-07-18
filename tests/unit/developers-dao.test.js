const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const developersDao = appRoot.require('api/v1/db/oracledb/developers-dao');
const developersSerializer = appRoot.require('api/v1/serializers/developers-serializer');

chai.should();
chai.use(chaiAsPromised);
// const { any } = sinon.match;

describe('Test developers-dao', () => {
  const fakeId = 'fakeId';

  beforeEach(() => {
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
  });
  afterEach(() => sinon.restore());
  });

  it('getDeveloperById should return singleResult', () => {
    // causes tests to pass
    // sinon.stub(developersDao, 'getDeveloperById').returns({});
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDeveloper').returnsArg(0);

    const fulfilledCases = [
      { expectResult: {} },
    ];

    const fulfilledPromises = [];
    _.each(fulfilledCases, ({ expectResult }) => {
      const result = developersDao.getDeveloperById(
        fakeId,
      );
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectResult)
        .then(() => {
          sinon.assert.callCount(developersSerializerStub, fulfilledCases.length);
        }));
    });
    // sinon.assert.callCount(developersSerializerStub, fulfilledCases.length);
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
