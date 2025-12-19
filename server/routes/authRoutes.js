const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { registerUser, loginUser, updateUserProfile, deleteUserProfile } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserProfile);

module.exports = router;
