
const appRoot = require('app-root-path');
const { expect } = require('chai');
const _ = require('lodash');

const { openapi } = appRoot.require('utils/load-openapi');
const { fakeId, fakeBaseUrl } = appRoot.require('tests/unit/test-data');

const resourceSubsetSchema = (resourceType, resourceAttributes) => {
  const fakeUrl = `${fakeBaseUrl}/${resourceType}s/fakeId`;
  const schema = {
    links: {
      self: fakeUrl,
    },
    data: {
      id: fakeId,
      type: resourceType,
      links: { self: fakeUrl },
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

module.exports = {
  testSingleResource,
  testMultipleResources,
  getDefinitionProps,
};
