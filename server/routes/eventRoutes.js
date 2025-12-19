const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    getMyEvents,
    updateEvent,
    deleteEvent,
    cleanupOrphanEvents
} = require('../controllers/eventController');
const { protect, organizer, protectOrganizer } = require('../middleware/authMiddleware');

router.route('/').get(getEvents).post(protectOrganizer, createEvent);
router.route('/myevents').get(protectOrganizer, getMyEvents);
router.route('/:id').get(getEventById).put(protectOrganizer, updateEvent).delete(protectOrganizer, deleteEvent);
router.delete('/orphans/cleanup', cleanupOrphanEvents); // Public for now to run easily

module.exports = router;
