const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

// sinon.replace(config, 'get', () => ({ oracledb: {} }));
const developersSerializer = appRoot.require('api/v1/serializers/developers-serializer');
const { getDefinitionProps, testSingleResource, testMultipleResources } = appRoot.require('tests/unit/serializer-test-helpers.js');
const testData = appRoot.require('tests/unit/test-data');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test developers-serializer', () => {
  const { rawDevelopers } = testData;
  const resourceType = 'developer';

  it('test serializeDeveloper', () => {
    const { serializeDeveloper } = developersSerializer;

    const serializedDeveloper = serializeDeveloper(rawDevelopers[0]);
    testSingleResource(serializedDeveloper, resourceType, _.omit(rawDevelopers[0], ['id']));
  });

  it('test serializeDevelopers', () => {
    const { serializeDevelopers } = developersSerializer;

    const serializedDevelopers = serializeDevelopers(rawDevelopers, testData.paginationQueries);
    testMultipleResources(serializedDevelopers);

    expect(serializedDevelopers).to.have.all.keys(_.keys(getDefinitionProps('DeveloperResults')));
  });

  it('serializeDevelopers should be rejected', () => {
    const { serializeDevelopers } = developersSerializer;
    const rejectedCases = [
      { rawData: rawDevelopers, queries: null, error: 'Cannot read property \'page[size]\' of null' },
      { rawData: null, queries: testData.paginationQueries, error: 'Cannot read property \'length\' of null' },
    ];

    const rejectedPromises = [];
    _.forEach(rejectedCases, ({ rawData, queries, error }) => {
      rejectedPromises.push(
        expect(() => serializeDevelopers(rawData, queries))
          .to.throw(error),
      );
    });
    return Promise.all(rejectedPromises);
  });
});
