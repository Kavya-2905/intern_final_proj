const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const bankingRoutes = require('./bankingRoutes');
const loanRoutes = require('./loanRoutes');
const cardRoutes = require('./cardRoutes');
const kycRoutes = require('./kycRoutes');
const notificationRoutes = require('./notificationRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/banking', bankingRoutes);
router.use('/loans', loanRoutes);
router.use('/cards', cardRoutes);
router.use('/kyc', kycRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
