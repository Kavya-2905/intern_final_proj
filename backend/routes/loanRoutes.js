const express = require('express');
const router = express.Router();
const { applyLoan, getLoans, calculateEMI, checkEligibility } = require('../controllers/loanController');
const { protect } = require('../middleware/auth');

router.post('/apply', protect, applyLoan);
router.get('/', protect, getLoans);
router.post('/calculate-emi', protect, calculateEMI);
router.post('/check-eligibility', protect, checkEligibility);

module.exports = router;
