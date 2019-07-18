/* const fakeId = 'fakeId';
const fakeBaseUrl = `/v1/developers/${fakeId}`;
const fakeType = 'fakeType';
const fakePath = 'fakePath';
const fakePathUrl = `${fakeBaseUrl}/${fakePath}`; */
const fakeDeveloperQuery = {
  'page[size]': 25,
  'page[number]': 1,
};
const rawDevelopers = {
  rows: [
    {
      id: 'fakeId',
      name: 'testDeveloper',
      website: 'http://www.example.com',
    },
  ],
};

module.exports = { rawDevelopers, fakeDeveloperQuery };
