const express = require('express');
const router = express.Router();
const { getAllUsers, approveKYC, rejectKYC, approveLoan, rejectLoan, getAnalytics, getPendingLoans } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/analytics', getAnalytics);
router.get('/loans/pending', getPendingLoans);
router.put('/kyc/:userId/approve', approveKYC);
router.put('/kyc/:userId/reject', rejectKYC);
router.put('/loans/:loanId/approve', approveLoan);
router.put('/loans/:loanId/reject', rejectLoan);

module.exports = router;
