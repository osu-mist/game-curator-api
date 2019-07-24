/* eslint no-unused-vars: 0 */

const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

const gamesSerializer = appRoot.require('api/v1/serializers/games-serializer');
const { getDefinitionProps, testSingleResource, testMultipleResources } = appRoot.require('tests/unit/serializer-test-helpers.js');
const testData = appRoot.require('tests/unit/test-data');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test games-serializer', () => {
  it('test serializeGame', () => {
    const { serializeGame } = gamesSerializer;
    const { rawGames } = testData;
    const resourceType = 'game';

    const serializedGame = serializeGame(rawGames[0]);
    testSingleResource(serializedGame, resourceType, _.omit(rawGames[0], ['id']));
  });
});
