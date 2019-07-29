const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiMatch = require('chai-match');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

const gamesSerializer = appRoot.require('api/v1/serializers/games-serializer');
const { getDefinitionProps, testSingleResource, testMultipleResources } = appRoot.require('tests/unit/serializer-test-helpers.js');
const testData = require('./test-data');

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

  it(`serializeGames should be rejected when
      1. data is passed without queries
      2. queries are passed without data`, () => {
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
