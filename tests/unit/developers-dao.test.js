const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const developersDao = appRoot.require('api/v1/db/oracledb/developers-dao');
const developersSerializer = appRoot.require('api/v1/serializers/developers-serializer');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);

describe('Test developers-dao', () => {
  const fakeId = 'fakeId';

  // most tests can use the same 'getConnection' stub but some need specific ones
  const standardConnStub = () => {
    sinon.stub(conn, 'getConnection').resolves({
      execute: (sql, sqlParams) => {
        const sqlResults = {
          multiResults: {
            rows: [{}, {}],
            outBinds: {
              outId: [1],
            },
          },
          singleResult: {
            rows: [{}],
            outBinds: {
              outId: [1],
            },
          },
          emptyResult: { rows: [] },
        };
        let result;
        if (sql.includes('DELETE')) {
          result = sqlResults.emptyResult;
        } else if ('developerId' in sqlParams) {
          result = sqlResults.singleResult;
        } else {
          result = sqlResults.multiResults;
        }
        return result;
      },
      close: () => null,
    });
  };

  afterEach(() => sinon.restore());

  it('getDevelopers should return multiResult', () => {
    standardConnStub();
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDevelopers');
    developersSerializerStub.returnsArg(0);

    const expectedResult = [{}, {}];
    const result = developersDao.getDevelopers(fakeId);
    return result.should
      .eventually.be.fulfilled
      .and.deep.equal(expectedResult)
      .then(() => {
        sinon.assert.callCount(developersSerializerStub, 1);
      });
  });

  it('getDeveloperById should return singleResult', () => {
    standardConnStub();
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDeveloper');
    developersSerializerStub.returnsArg(0);

    const fulfilledCases = [
      { expectedResult: {} },
    ];

    const fulfilledPromises = [];
    _.each(fulfilledCases, ({ expectedResult }) => {
      const result = developersDao.getDeveloperById(
        fakeId,
      );
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult)
        .then(() => {
          sinon.assert.callCount(developersSerializerStub, fulfilledCases.length);
        }));
    });
    return Promise.all(fulfilledPromises);
  });

  it('getDeveloperById should be rejected', () => {
    const rejectedCases = [
      { testCase: '[]', error: 'Cannot read property \'length\' of undefined' },
      { testCase: { rows: [{}, {}] }, error: 'Expect a single object but got multiple results' },
    ];

    const rejectedPromises = [];
    _.each(rejectedCases, ({ testCase, error }) => {
      sinon.stub(conn, 'getConnection').resolves({
        execute: () => testCase,
        close: () => null,
      });

      const result = developersDao.getDeveloperById('fakeId');
      rejectedPromises.push(result.should
        .eventually.be.rejectedWith(Error, error));

      sinon.restore();
    });
    return Promise.all(rejectedPromises);
  });

  it('postDeveloper with improper body should be rejected', () => {
    standardConnStub();
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDeveloper');
    developersSerializerStub.returnsArg(0);

    const result = developersDao.postDeveloper('fakeId', 'fakeBody');
    return result.should
      .eventually.be.rejected
      .and.be.an.instanceOf(TypeError)
      .then(() => {
        sinon.assert.notCalled(developersSerializerStub);
      });
  });

  it('postDeveloper should return singleResult', () => {
    standardConnStub();
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDeveloper');
    developersSerializerStub.returnsArg(0);

    const fakeBody = {
      data: {
        attributes: {
          name: 'test',
        },
      },
    };

    const expectedResult = {};
    const result = developersDao.postDeveloper(fakeBody);
    return result.should
      .eventually.be.fulfilled
      .and.deep.equal(expectedResult);
  });

  it('postDeveloper should be rejected', async () => {
    const rejectedCases = [
      { testCase: [], error: 'Cannot read property \'outId\' of undefined' },
      // TODO figure out why this error is being thrown
      { testCase: { outBinds: { outId: 'fakeId' } }, error: 'ORA-24415: Missing or null username.' },
    ];

    const rejectedPromises = [];
    _.forEach(rejectedCases, ({ testCase, error }) => {
      const connStub = sinon.stub(conn, 'getConnection').resolves({
        execute: () => testCase,
        close: () => null,
      });

      const fakeBody = { data: { attributes: 'fakeAttributes' } };
      const result = await developersDao.postDeveloper(fakeBody);
      rejectedPromises.push(result.should
        .eventually.be.rejectedWith(Error, error));

      connStub.restore();
    });
    return Promise.all(rejectedPromises);
  });

  it('deleteDeveloper should return empty result', () => {
    standardConnStub();
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDeveloper');
    developersSerializerStub.returnsArg(0);

    const expectedResult = [];
    const result = developersDao.deleteDeveloper('fakeId');
    return result.should
      .eventually.be.fulfilled
      .and.has.property('rows').deep.equal(expectedResult);
  });

  it('patchDeveloper with improper body should be rejected', () => {
    standardConnStub();
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDeveloper');
    developersSerializerStub.returnsArg(0);

    const result = developersDao.patchDeveloper('fakeId', 'fakeBody');
    return result.should
      .eventually.be.rejected
      .and.be.an.instanceOf(Error)
      .then(() => {
        sinon.assert.notCalled(developersSerializerStub);
      });
  });

  it('patchDeveloper should return singleResult', () => {
    standardConnStub();
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDeveloper');
    developersSerializerStub.returnsArg(0);

    const fakeBody = {
      data: {
        id: fakeId,
        attributes: {
          name: 'test',
        },
      },
    };

    const expectedResult = [{}];
    const result = developersDao.patchDeveloper(fakeId, fakeBody);
    return result.should
      .eventually.be.fulfilled
      .and.has.property('rows').deep.equal(expectedResult);
  });
});
