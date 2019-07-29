const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const config = require('config');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
let developersDao; // proxyquire is later used to import developers-dao class
const developersSerializer = appRoot.require('api/v1/serializers/developers-serializer');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);

describe('Test developers-dao', () => {
  const fakeId = 'fakeId';

  beforeEach(() => {
    const serializeDeveloperStub = sinon.stub(developersSerializer, 'serializeDeveloper');
    const serializeDevelopersStub = sinon.stub(developersSerializer, 'serializeDevelopers');
    serializeDeveloperStub.returnsArg(0);
    serializeDevelopersStub.returnsArg(0);

    developersDao = proxyquire(`${appRoot}/api/v1/db/oracledb/developers-dao`, {
      '../../serializers/developers-serializer': {
        serializeDeveloper: serializeDeveloperStub,
        serializeDevelopers: serializeDevelopersStub,
      },
    });
  });
  afterEach(() => sinon.restore());

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
        if ('developerId' in sqlParams) {
          result = sqlResults.singleResult;
        } else {
          result = sqlResults.multiResults;
        }
        return result;
      },
      close: () => null,
    });
  };

  it('getDevelopers should be fulfilled with multiple results', () => {
    standardConnStub();

    const expectedResult = [{}, {}];
    const result = developersDao.getDevelopers(fakeId);
    return result.should
      .eventually.be.fulfilled
      .and.deep.equal(expectedResult);
  });

  it('getDeveloperById should be fulfilled with a single result', () => {
    standardConnStub();

    const fulfilledCases = [
      { expectedResult: {} },
    ];

    const fulfilledPromises = [];
    _.each(fulfilledCases, ({ expectedResult }) => {
      const result = developersDao.getDeveloperById(fakeId);
      fulfilledPromises.push(result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult));
    });
    return Promise.all(fulfilledPromises);
  });

  it('getDeveloperById should be rejected when multiple values are returned', () => {
    const rejectedCases = [
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

    const result = developersDao.postDeveloper('fakeId', 'fakeBody');
    return result.should
      .eventually.be.rejected
      .and.be.an.instanceOf(TypeError);
  });

  it('postDeveloper should be fulfilled with singleResult', () => {
    standardConnStub();

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

  // had to make both postDeveloper rejection tests seperate due to async issues
  // originally I was stubbing and restoring conn.getConnection in a loop
  // the restore would happen before the promise resolved and caused issues
  // if I wait to restore then the second loop starts and you can't stub an already stubbed function
  it('postDeveloper should be rejected', () => {
    const testCase = [];
    const expectedError = 'Cannot read property \'outId\' of undefined';

    sinon.stub(conn, 'getConnection').resolves({
      execute: () => testCase,
      close: () => null,
    });

    const fakeBody = { data: { attributes: 'fakeAttributes' } };
    const result = developersDao.postDeveloper(fakeBody);
    return result.should
      .eventually.be.rejectedWith(Error, expectedError);
  });

  it('postDeveloper should be rejected', () => {
    const testCase = { outBinds: { outId: 'fakeId' } };
    const expectedError = 'Cannot read property \'length\' of undefined';

    sinon.stub(conn, 'getConnection').resolves({
      execute: () => testCase,
      close: () => null,
    });

    const fakeBody = { data: { attributes: 'fakeAttributes' } };
    const result = developersDao.postDeveloper(fakeBody);
    return result.should
      .eventually.be.rejectedWith(Error, expectedError);
  });

  it('deleteDeveloper should be fulfilled with single result', () => {
    standardConnStub();

    const expectedResult = [{}];
    const result = developersDao.deleteDeveloper('fakeId');
    return result.should
      .eventually.be.fulfilled
      .and.has.property('rows').deep.equal(expectedResult);
  });

  it('patchDeveloper with improper body should be rejected', () => {
    standardConnStub();

    const result = developersDao.patchDeveloper('fakeId', 'fakeBody');
    return result.should
      .eventually.be.rejected
      .and.be.an.instanceOf(Error);
  });

  it('patchDeveloper should be fulfilled with singleResult', () => {
    standardConnStub();

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
