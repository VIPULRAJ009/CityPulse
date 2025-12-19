const express = require('express');
const router = express.Router();
const { createReview, getEventReviews, getOrganizerReviews, updateReview, getAllReviews } = require('../controllers/reviewController');
const { protect, protectOrganizer } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.get('/', getAllReviews);
router.get('/event/:eventId', getEventReviews);
router.get('/organizer', protectOrganizer, getOrganizerReviews);

module.exports = router;
