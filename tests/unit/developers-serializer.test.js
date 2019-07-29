const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

const developersSerializer = appRoot.require('api/v1/serializers/developers-serializer');
const { getDefinitionProps, testSingleResource, testMultipleResources } = appRoot.require('tests/unit/serializer-test-helpers.js');
const testData = require('./test-data');

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

  it(`serializeDevelopers should be rejected when
        1. data is passed without queries
        2. queries are passed without data`, () => {
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
