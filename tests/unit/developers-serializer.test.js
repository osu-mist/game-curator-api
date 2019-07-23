const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

// sinon.replace(config, 'get', () => ({ oracledb: {} }));
const developersSerializer = appRoot.require('api/v1/serializers/developers-serializer');
const testData = appRoot.require('tests/unit/test-data');
const { openapi } = appRoot.require('utils/load-openapi');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test developers-serializer', () => {
  const { fakeId, fakeBaseUrl } = testData;

  const resourceSubsetSchema = (resourceType, resourceAttributes) => {
    const schema = {
      links: {
        self: `${fakeBaseUrl}`,
      },
      data: {
        id: fakeId,
        type: resourceType,
        links: { self: `${fakeBaseUrl}` },
      },
    };
    if (resourceAttributes) {
      schema.data.attributes = resourceAttributes;
    }
    return schema;
  };

  /**
   * @summary Helper function for lite-testing single resource
   * @function
   * @param {object} serializedResource serialized resource
   * @param {string} resourceType resource type
   * @param {object} nestedProps object containing properties nested under data.attributes
   */
  const testSingleResource = (serializedResource, resourceType, nestedProps) => {
    expect(serializedResource).to.containSubset(resourceSubsetSchema(resourceType, nestedProps));

    if (nestedProps) {
      _.forEach(Object.keys(nestedProps), (prop) => {
        expect(serializedResource).to.have.nested.property(`data.attributes.${prop}`);
      });
    }
  };

  /**
   * @summary Helper function for lite-testing multiple resources
   * @function
   * @param {Object} serializedResources serialized resources
   * @returns {Object} data object from serialized resources for further use
   */
  const testMultipleResources = (serializedResources) => {
    const serializedResourcesData = serializedResources.data;
    expect(_.omit(serializedResources, 'meta')).to.have.keys('data', 'links');
    expect(serializedResourcesData).to.be.an('array');

    return serializedResourcesData;
  };

  /**
   * @summary Helper function to get definition from openapi specification
   * @function
   * @param {string} definition the name of definition
   * @param {Object} nestedOption nested option
   * @param {boolean} nestedOption.dataItem a boolean which represents whether it's a data item
   * @param {string} nestedOption.dataField data field name
   * @returns {Object}
   */
  const getDefinitionProps = (definition, nestedOption) => {
    let result = openapi.definitions[definition].properties;
    if (nestedOption) {
      const { dataItem, dataField } = nestedOption;
      if (dataItem) {
        result = result.data.items.properties.attributes.properties;
      } else if (dataField) {
        result = result.data.properties.attributes.properties[dataField].items.properties;
      }
    }
    return result;
  };

  it('test serializeDeveloper', () => {
    const { serializeDeveloper } = developersSerializer;
    const { rawDevelopers } = testData;
    const resourceType = 'developer';

    const serializedDeveloper = serializeDeveloper(rawDevelopers[0]);
    testSingleResource(serializedDeveloper, resourceType, _.omit(rawDevelopers[0], ['id']));
  });

  it('test serializeDevelopers', () => {
    const { serializeDevelopers } = developersSerializer;
    const { rawDevelopers } = testData;

    const serializedDevelopers = serializeDevelopers(rawDevelopers, testData.paginationQueries);
    testMultipleResources(serializedDevelopers);

    expect(serializedDevelopers).to.have.all.keys(_.keys(getDefinitionProps('DeveloperResults')));
  });

  it('serializeDevelopers should be rejected', () => {
    const { serializeDevelopers } = developersSerializer;
    const { rawDevelopers } = testData;
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
