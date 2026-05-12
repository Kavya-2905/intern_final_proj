const express = require('express');
const router = express.Router();
const { submitKYC, getKYCStatus, uploadDocument } = require('../controllers/kycController');
const { protect } = require('../middleware/auth');

router.post('/submit', protect, uploadDocument, submitKYC);
router.get('/status', protect, getKYCStatus);

module.exports = router;
