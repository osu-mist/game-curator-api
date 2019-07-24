const fakeId = 'fakeId';
const fakeBaseUrl = '/v1';
/* const fakeType = 'fakeType';
const fakePath = 'fakePath';
const fakePathUrl = `${fakeBaseUrl}/${fakePath}`; */
const fakeDeveloperQuery = {
  'page[size]': 25,
  'page[number]': 1,
};
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
    score: 2,
    releaseDate: '1994-12-5',
  },
  {
    id: '12314315',
    name: 'Half Life 3',
    developerId: '1212325',
    score: 5,
    releaseDate: '2099-10-20',
  },
];
const paginationQueries = {
  'page[number]': 1,
  'page[size]': 25,
};

module.exports = {
  rawDevelopers,
  fakeDeveloperQuery,
  fakeId,
  fakeBaseUrl,
  paginationQueries,
  rawGames,
};
