/* eslint no-unused-vars: 0 */

const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const sinon = require('sinon');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const reviewsDao = appRoot.require('api/v1/db/oracledb/reviews-dao');
const reviewsSerializer = appRoot.require('api/v1/serializers/reviews-serializer');

chai.should();
chai.use(chaiAsPromised);

describe('Test reviews-dao', () => {
  afterEach(() => sinon.restore());
});
