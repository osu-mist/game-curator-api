/* eslint no-unused-vars: 0 */

const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const config = require('config');
const _ = require('lodash');
const sinon = require('sinon');

sinon.replace(config, 'get', () => ({ oracledb: {} }));
const conn = appRoot.require('api/v1/db/oracledb/connection');
const gamesDao = appRoot.require('api/v1/db/oracledb/games-dao');
const gamesSerializer = appRoot.require('api/v1/serializers/games-serializer');

chai.should();
chai.use(chaiAsPromised);
