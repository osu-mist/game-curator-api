const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiExclude = require('chai-exclude');
const config = require('config');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
let developersDao; // proxyquire is later used to import developers-dao class
const developersSerializer = appRoot.require('api/v1/serializers/developers-serializer');
const testData = require('./test-data');
const { createConnStub } = require('./test-helpers');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);

describe('Test developers-dao', () => {
  const { fakeId, fakeBody } = testData;

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

  describe('Test getDevelopers', () => {
    const testCases = [
      { testCase: [{}], description: 'a single result' },
      { testCase: [{}, {}], description: 'multiple results' },
      { testCase: [], description: 'no results' },
    ];
    _.forEach(testCases, ({ testCase, description }) => {
      it(`getDevelopers should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = developersDao.getDevelopers(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(testCase);
      });
    });
  });

  describe('Test getDeveloperById', () => {
    const fulfilledCases = [
      { expectedResult: [{}], description: 'a single result' },
      { expectedResult: [], description: 'an empty result' },
    ];
    _.forEach(fulfilledCases, ({ expectedResult, description }) => {
      it(`getDeveloperById should be fulfilled with ${description}`, () => {
        createConnStub({ rows: expectedResult });
        const result = developersDao.getDeveloperById(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult[0]);
      });
    });

    it('getDeveloperById should be rejected when multiple values are returned', () => {
      const testCase = { rows: [{}, {}] };
      const error = 'Expect a single object but got multiple results';

      createConnStub(testCase);

      const result = developersDao.getDeveloperById(fakeId);
      return result.should.eventually.be.rejectedWith(Error, error);
    });
  });

  describe('Test postDeveloper', () => {
    it('postDeveloper with improper body should be rejected', () => {
      createConnStub();

      const result = developersDao.postDeveloper(fakeId, 'fakeBody');
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(TypeError);
    });

    it('postDeveloper should be fulfilled with singleResult', () => {
      const expectedResult = {};
      createConnStub({ rows: [{}], outBinds: { outId: 1 } });
      const result = developersDao.postDeveloper(fakeBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equal(expectedResult);
    });

    const testCases = [
      {
        testCase: [],
        expectedError: 'Cannot read property \'outId\' of undefined',
        testDescription: 'outId is not returned',
      },
      {
        testCase: { outBinds: { outId: fakeId } },
        expectedError: 'Cannot read property \'length\' of undefined',
        testDescription: 'outId is returned without an additional response',
      },
    ];
    _.forEach(testCases, ({ testCase, expectedError, testDescription }) => {
      it(`postDeveloper should be rejected when ${testDescription}`, () => {
        createConnStub(testCase);

        const result = developersDao.postDeveloper(fakeBody);
        return result.should
          .eventually.be.rejectedWith(Error, expectedError);
      });
    });
  });

  describe('Test deleteDeveloper', () => {
    const testCases = [
      { expectedResult: [{}], description: 'with a single result' },
      { expectedResult: { rowsAffected: 0 }, description: 'with 0 rowsAffected' },
    ];
    _.forEach(testCases, ({ expectedResult, description }) => {
      it(`deleteDeveloper should be fulfilled with ${description}`, () => {
        createConnStub(expectedResult);
        const result = developersDao.deleteDeveloper(fakeId);
        return result.should
          .eventually.be.fulfilled
          .and.deep.equal(expectedResult);
      });
    });
  });

  describe('Test patchDeveloper', () => {
    it('patchDeveloper with improper body should be rejected', () => {
      createConnStub();

      const result = developersDao.patchDeveloper(fakeId, 'badBody');
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });

    const testCases = [
      { testCase: [{}], description: 'a single result' },
      { testCase: { rowsAffected: 0 }, description: '0 rowsAffected' },
    ];
    _.forEach(testCases, ({ testCase, description }) => {
      it(`patchDeveloper should be fulfilled with ${description}`, () => {
        createConnStub({ rows: testCase });
        const result = developersDao.patchDeveloper(fakeId, fakeBody);
        return result.should
          .eventually.be.fulfilled
          .and.has.property('rows').deep.equal(testCase);
      });
    });
  });
});
