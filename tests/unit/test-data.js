const fakeId = 'fakeId';
const fakeBaseUrl = '/v1';
const rawDevelopers = [
  {
    id: fakeId,
    name: 'testDeveloper',
    website: 'http://www.example.com',
  },
  {
    id: '123123',
    name: 'fakeDeveloper',
    website: 'www.notascam.com',
  },
];
const rawGames = [
  {
    id: fakeId,
    name: 'testGame',
    developerId: fakeId,
    score: '2',
    releaseDate: '5/12/1994',
  },
  {
    id: '12314315',
    name: 'Half Life 3',
    developerId: '1212325',
    score: '5',
    releaseDate: '10-20-2099',
  },
];
const gameConverterData = [
  {
    score: '2',
    releaseDate: '5/12/1994',
  },
  {
    score: '5',
    releaseDate: '10-20-2099',
  },
];
const rawReviews = [
  {
    id: fakeId,
    gameId: fakeId,
    reviewer: 'fakeReviewer',
    score: '4',
    reviewText: 'this is a fake game review',
    reviewDate: '10/26/2011',
  },
  {
    id: '123123123',
    gameId: '232412',
    reviewer: 'fakeNews',
    score: '1',
    reviewText: 'this review is fake news',
    reviewDate: '5-30-2005',
  },
];
const reviewConverterData = [
  {
    score: '4',
    reviewDate: '10/26/2011',
  },
  {
    score: '1',
    reviewDate: '5-30-2005',
  },
];
const paginationQueries = {
  'page[number]': 1,
  'page[size]': 25,
};

module.exports = {
  rawDevelopers,
  fakeId,
  fakeBaseUrl,
  paginationQueries,
  rawGames,
  rawReviews,
  gameConverterData,
  reviewConverterData,
};
