/* eslint no-unused-vars: 0 */

const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');

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
    console.log(_.omit(testData.rawDevelopers[0], ['id']));
    testSingleResource(serializedDeveloper, resourceType, _.omit(testData.rawDevelopers[0], ['id']));
    // console.log(resourceSubsetSchema(resourceType))
    // console.log(_.keys(getDefinitionProps('DeveloperResource')));
  });
});
