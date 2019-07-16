const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const developersDao = appRoot.require('api/v1/db/oracledb/developers-dao');

chai.should();
chai.use(chaiAsPromised);

describe('Test the test thing', () => {
  console.log('This test is running');

  sinon.stub(conn, 'getConnection').resolves({
    execute: (sql) => {
      const sqlResults = {
        multiResults: { rows: [{}, {}] },
        singleResults: { rows: [{}] },
      };
      return sql in sqlResults ? sqlResults[sql] : sqlResults.singleResults;
    },
    close: () => null,
  });

});
