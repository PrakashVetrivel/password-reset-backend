const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.resetPassword);
router.post('/reset-password/:token', authController.updatePassword);

module.exports = router;
