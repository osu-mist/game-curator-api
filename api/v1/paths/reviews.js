const appRoot = require('app-root-path');

const reviewsDao = require('../db/oracledb/reviews-dao');

const { errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get reviews
 */
const get = async (req, res) => {
  try {
    const result = await reviewsDao.getReviews(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary Post reviews
 */
const post = async (req, res) => {
  try {
    const result = await reviewsDao.postReview(req.body);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/reviews'].get;
post.apiDoc = paths['/reviews'].post;

module.exports = { get, post };
