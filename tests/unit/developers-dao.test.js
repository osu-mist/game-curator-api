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

  beforeEach(() => {
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
  });
  afterEach(() => sinon.restore());

  it('getDevelopers should return multiResult', () => {
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

  it('postDeveloper with improper body should be rejected', () => {
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

  it('deleteDeveloper should return empty result', () => {
    const developersSerializerStub = sinon.stub(developersSerializer, 'serializeDeveloper');
    developersSerializerStub.returnsArg(0);

    const expectedResult = [];
    const result = developersDao.deleteDeveloper('fakeId');
    return result.should
      .eventually.be.fulfilled
      .and.has.property('rows').deep.equal(expectedResult);
  });

  it('patchDeveloper with improper body should be rejected', () => {
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
