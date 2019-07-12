const appRoot = require('app-root-path');

const reviewsDao = require('../../db/oracledb/reviews-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get review by unique ID
 */
const get = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const result = await reviewsDao.getReviewById(reviewId);
    if (!result) {
      errorBuilder(res, 404, 'A review with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

/**
 * @summary Delete review by id
 */
const del = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const result = await reviewsDao.deleteReview(reviewId);
    if (result.rowsAffected < 1) {
      errorBuilder(res, 404, 'A review with the specified ID was not found.');
    } else {
      // send 204 on successful delete
      res.sendStatus(204);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/reviews/{reviewId}'].get;

module.exports = { get, del };
