const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getEventBookings,
    getDashboardStats,
    getAllOrganizerBookings,
    cancelBooking,
    deleteBooking
} = require('../controllers/bookingController');
const { protect, organizer, protectOrganizer } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);
router.delete('/:id', protect, deleteBooking);
router.get('/organizer', protectOrganizer, getAllOrganizerBookings);
router.get('/stats', protectOrganizer, getDashboardStats);
router.get('/event/:eventId', protectOrganizer, getEventBookings);

module.exports = router;
