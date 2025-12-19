const express = require('express');
const router = express.Router();
const { createCoupon, getCoupons, deleteCoupon, validateCoupon } = require('../controllers/couponController');
const { protect, protectOrganizer } = require('../middleware/authMiddleware');

router.route('/')
    .post(protectOrganizer, createCoupon)
    .get(protectOrganizer, getCoupons);

router.route('/:id').delete(protectOrganizer, deleteCoupon);

router.route('/validate').post(protect, validateCoupon);

module.exports = router;
