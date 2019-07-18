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
const testData = require('./test-data');

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

  it('getDevelopers should return multiResult', () => {
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDevelopers');
    developersSerializerStub.returnsArg(0);

    const fulfilledPromises = [];
    const result = developersDao.getDevelopers(fakeId);
    fulfilledPromises.push(result.should
      .eventually.be.fulfilled
      .and.deep.equal([{}])
      .then(() => {
        sinon.assert.callCount(developersSerializerStub, 1);
      }));
    return Promise.all(fulfilledPromises);
  });

  it('getDeveloperById should return singleResult', () => {
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDeveloper');
    developersSerializerStub.returnsArg(0);

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
});

describe('Test getDevelopers', () => {
  beforeEach(() => {
    sinon.stub(conn, 'getConnection').resolves({
      execute: () => ({ rows: testData.rawDevelopers }),
      close: () => null,
    });
  });
  afterEach(() => sinon.restore());

  it('getDevelopers should return data', () => {
    console.log(developersDao.getDevelopers(testData.fakeDeveloperQuery));
  });
});
