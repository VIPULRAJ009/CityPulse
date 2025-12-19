const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protectUserOrOrganizer } = require('../middleware/authMiddleware');

router.route('/').get(protectUserOrOrganizer, getMyNotifications);
router.route('/read-all').put(protectUserOrOrganizer, markAllAsRead);
router.route('/:id/read').put(protectUserOrOrganizer, markAsRead);

module.exports = router;
