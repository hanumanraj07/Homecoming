const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, changePassword, deleteAccount } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/me', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/me', protect, deleteAccount);

module.exports = router;
