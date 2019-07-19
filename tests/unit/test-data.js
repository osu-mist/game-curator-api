const fakeId = 'fakeId';
const fakeBaseUrl = `/v1/developers/${fakeId}`;
/* const fakeType = 'fakeType';
const fakePath = 'fakePath';
const fakePathUrl = `${fakeBaseUrl}/${fakePath}`; */
const fakeDeveloperQuery = {
  'page[size]': 25,
  'page[number]': 1,
};
const rawDevelopers = [
  {
    id: 'fakeId',
    name: 'testDeveloper',
    website: 'http://www.example.com',
  },
  {
    id: '123123',
    name: 'fakeDeveloper',
    website: 'www.notascam.com',
  },
];

module.exports = {
  rawDevelopers,
  fakeDeveloperQuery,
  fakeId,
  fakeBaseUrl,
};
