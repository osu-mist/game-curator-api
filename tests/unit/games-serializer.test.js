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
  const { rawGames } = testData;
  const resourceType = 'game';

  it('test serializeGame', () => {
    const { serializeGame } = gamesSerializer;

    const serializedGame = serializeGame(rawGames[0]);
    testSingleResource(serializedGame, resourceType, _.omit(rawGames[0], ['id']));
  });

  it('test serializeGames', () => {
    const { serializeGames } = gamesSerializer;

    const serializedGames = serializeGames(rawGames, testData.paginationQueries);
    testMultipleResources(serializedGames);

    expect(serializedGames).to.have.all.keys(_.keys(getDefinitionProps('GameResults')));
  });

  it('serializeGames should be rejected', () => {
    const { serializeGames } = gamesSerializer;
    const rejectedCases = [
      { rawData: rawGames, queries: null, error: 'Cannot read property \'page[size]\' of null' },
      { rawData: null, queries: testData.paginationQueries, error: 'Cannot read property \'length\' of null' },
    ];

    const rejectedPromises = [];
    _.forEach(rejectedCases, ({ rawData, queries, error }) => {
      rejectedPromises.push(
        expect(() => serializeGames(rawData, queries))
          .to.throw(error),
      );
    });
    return Promise.all(rejectedPromises);
  });
});
