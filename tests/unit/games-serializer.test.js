const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiMatch = require('chai-match');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

const { getDefinitionProps, testSingleResource, testMultipleResources } = require('./test-helpers.js');
const testData = require('./test-data');

const gamesSerializer = appRoot.require('api/v1/serializers/games-serializer');

chai.should();
chai.use(chaiAsPromised);
chai.use(chaiMatch);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test games-serializer', () => {
  const { rawGames } = testData;
  const resourceType = 'game';

  it('serializeGame should form a single JSON result as defined in openapi', () => {
    const { serializeGame } = gamesSerializer;

    const serializedGame = serializeGame(rawGames[0]);
    testSingleResource(serializedGame, resourceType, _.omit(rawGames[0], ['id']));
  });

  it('serializeGames should form a multiple JSON result as defined in openapi', () => {
    const { serializeGames } = gamesSerializer;

    const serializedGames = serializeGames(rawGames, testData.paginationQueries);
    testMultipleResources(serializedGames);

    expect(serializedGames).to.have.all.keys(_.keys(getDefinitionProps('GameResults')));
  });

  const rejectedCases = testData.serializerRejectedCases(rawGames);
  _.forEach(rejectedCases, ({
    rawData,
    queries,
    error,
    description,
  }) => {
    it(`serializeGames should be rejected when ${description}`, () => {
      const { serializeGames } = gamesSerializer;
      return expect(() => serializeGames(rawData, queries)).to.throw(error);
    });
  });

  it(`gameConverter should convert score values from strings to numbers
      and releaseDate values to yyyy-mm-dd date format`, () => {
    const { gameConverter } = gamesSerializer;
    // rawGames from testData is modified by the other tests
    // this test needs its own data so it can be tested in isolation from the others
    const { gameConverterData } = testData;

    const testResults = [];
    _.forEach(gameConverterData, (game) => {
      testResults.push(game.score.should
        .be.a('string', 'rawGames score should initially be a string'));
    });

    gameConverter(gameConverterData);

    _.forEach(gameConverterData, (game) => {
      testResults.push(game.score.should
        .be.a('number', 'rawGames score should be converted to a number'));
      testResults.push(expect(game.releaseDate)
        .to.match(/^(\d{4}-([1-9]|1[0-2])-([1-9]|[12]\d|3[01]))$/));
    });

    return Promise.all(testResults);
  });
});
