const appRoot = require('app-root-path');

const reviewsDao = require('../db/oracledb/reviews-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
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
    if (!await reviewsDao.isValidGame(req.body.data.attributes.gameId)) {
      errorBuilder(res, 400, ['A game with gameId does not exist.']);
    } else {
      const result = await reviewsDao.postReview(req.body);
      res.status(201).send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/reviews'].get;
post.apiDoc = paths['/reviews'].post;

module.exports = { get, post };
