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

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test developers-serializer', () => {
  const { fakeId, fakeBaseUrl } = testData;
  const resourceSubsetSchema = (resourceType, resourceAttributes) => {
    const schema = {
      links: {
        self: `${fakeBaseUrl}/${resourceType}`,
      },
      data: {
        id: fakeId,
        type: resourceType,
        links: { self: null },
      },
    };
    if (resourceAttributes) {
      schema.data.attributes = resourceAttributes;
    }
    return schema;
  };

  it('test serializeDeveloper', () => {
    const { serializeDeveloper } = developersSerializer;
    const { rawDevelopers } = testData;
    const resourceType = 'developer';

    const serializedDeveloper = serializeDeveloper(rawDevelopers);
    console.log(serializedDeveloper);
  });
});
