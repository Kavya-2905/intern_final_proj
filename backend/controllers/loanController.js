const Loan = require('../models/Loan');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Apply for a loan
// @route   POST /api/loans/apply
// @access  Private
exports.applyLoan = async (req, res) => {
  try {
    const { type, amount, interestRate, tenure, documents } = req.body;
    const userId = req.user._id;

    // Calculate EMI
    const monthlyRate = interestRate / 12 / 100;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);

    const loan = await Loan.create({
      user: userId,
      type,
      amount,
      interestRate,
      tenure,
      emi: Math.round(emi),
      documents: documents || []
    });

    // Create notification for user
    await Notification.create({
      user: userId,
      message: `Loan application for ₹${amount} submitted successfully`,
      type: 'loan'
    });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted',
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's loans
// @route   GET /api/loans
// @access  Private
exports.getLoans = async (req, res) => {
  try {
    const userId = req.user._id;
    const loans = await Loan.find({ user: userId }).sort({ appliedAt: -1 });

    res.json({
      success: true,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calculate EMI
// @route   POST /api/loans/calculate-emi
// @access  Private
exports.calculateEMI = async (req, res) => {
  try {
    const { amount, interestRate, tenure } = req.body;

    const monthlyRate = interestRate / 12 / 100;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - amount;

    res.json({
      success: true,
      data: {
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check loan eligibility
// @route   POST /api/loans/check-eligibility
// @access  Private
exports.checkEligibility = async (req, res) => {
  try {
    const { amount, type } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Simple eligibility logic
    let maxLoanAmount = 0;
    
    switch(type) {
      case 'personal':
        maxLoanAmount = user.balance * 5;
        break;
      case 'home':
        maxLoanAmount = user.balance * 20;
        break;
      case 'education':
        maxLoanAmount = user.balance * 10;
        break;
      case 'vehicle':
        maxLoanAmount = user.balance * 8;
        break;
      default:
        maxLoanAmount = user.balance * 5;
    }

    const isEligible = amount <= maxLoanAmount && user.kycStatus === 'verified';

    res.json({
      success: true,
      data: {
        isEligible,
        maxLoanAmount,
        reason: !isEligible ? (user.kycStatus !== 'verified' ? 'KYC verification required' : 'Amount exceeds eligible limit') : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
