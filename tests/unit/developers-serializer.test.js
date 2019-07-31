const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

const { getDefinitionProps, testSingleResource, testMultipleResources } = require('./test-helpers.js');
const testData = require('./test-data');

const developersSerializer = appRoot.require('api/v1/serializers/developers-serializer');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test developers-serializer', () => {
  const { rawDevelopers } = testData;
  const resourceType = 'developer';

  it('serializeDeveloper should form a single JSON result as defined in openapi', () => {
    const { serializeDeveloper } = developersSerializer;

    const serializedDeveloper = serializeDeveloper(rawDevelopers[0]);
    testSingleResource(serializedDeveloper, resourceType, _.omit(rawDevelopers[0], ['id']));
  });

  it('serializeDevelopers should form a multiple JSON result as defined in openapi', () => {
    const { serializeDevelopers } = developersSerializer;

    const serializedDevelopers = serializeDevelopers(rawDevelopers, testData.paginationQueries);
    testMultipleResources(serializedDevelopers);

    expect(serializedDevelopers).to.have.all.keys(_.keys(getDefinitionProps('DeveloperResults')));
  });

  const rejectedCases = testData.serializerRejectedCases(rawDevelopers);
  _.forEach(rejectedCases, ({
    rawData,
    queries,
    error,
    description,
  }) => {
    it(`serializeDevelopers should be rejected when ${description}`, () => {
      const { serializeDevelopers } = developersSerializer;
      return expect(() => serializeDevelopers(rawData, queries))
        .to.throw(error);
    });
  });
});
