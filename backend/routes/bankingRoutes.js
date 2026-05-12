const express = require('express');
const router = express.Router();
const { getDashboard, depositMoney, withdrawMoney, transferMoney, getTransactions, deleteTransaction, clearUserTransactions } = require('../controllers/bankingController');
const { protect } = require('../middleware/auth');
const { transactionValidation, transferValidation } = require('../middleware/validator');

router.get('/dashboard', protect, getDashboard);
router.post('/deposit', protect, transactionValidation, depositMoney);
router.post('/withdraw', protect, transactionValidation, withdrawMoney);
router.post('/transfer', protect, transferValidation, transferMoney);
router.get('/transactions', protect, getTransactions);
router.delete('/transactions/:id', protect, deleteTransaction);
router.delete('/transactions', protect, clearUserTransactions);

module.exports = router;
