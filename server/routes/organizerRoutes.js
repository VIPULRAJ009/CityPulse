const express = require('express');
const router = express.Router();
const { registerOrganizer, loginOrganizer, updateOrganizerProfile, deleteOrganizerProfile } = require('../controllers/organizerAuthController');
const { protectOrganizer } = require('../middleware/authMiddleware');

router.post('/register', registerOrganizer);
router.post('/login', loginOrganizer);
router.put('/profile', protectOrganizer, updateOrganizerProfile);
router.delete('/profile', protectOrganizer, deleteOrganizerProfile);

module.exports = router;
