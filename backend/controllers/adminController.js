const User = require('../models/User');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve KYC
// @route   PUT /api/admin/kyc/:userId/approve
// @access  Admin
exports.approveKYC = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.kycStatus = 'verified';
    user.isVerified = true;
    await user.save();

    // Create notification
    await Notification.create({
      user: user._id,
      message: 'Your KYC has been verified successfully',
      type: 'kyc'
    });

    res.json({
      success: true,
      message: 'KYC approved',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject KYC
// @route   PUT /api/admin/kyc/:userId/reject
// @access  Admin
exports.rejectKYC = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.kycStatus = 'rejected';
    await user.save();

    // Create notification
    await Notification.create({
      user: user._id,
      message: 'Your KYC verification was rejected. Please resubmit documents.',
      type: 'kyc'
    });

    res.json({
      success: true,
      message: 'KYC rejected',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve loan
// @route   PUT /api/admin/loans/:loanId/approve
// @access  Admin
exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    loan.status = 'approved';
    loan.approvedAt = Date.now();
    await loan.save();

    // Credit amount to user
    const user = await User.findById(loan.user);
    user.balance += loan.amount;
    await user.save();

    // Create notification
    await Notification.create({
      user: loan.user,
      message: `Your loan of ₹${loan.amount} has been approved and credited`,
      type: 'loan'
    });

    res.json({
      success: true,
      message: 'Loan approved',
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject loan
// @route   PUT /api/admin/loans/:loanId/reject
// @access  Admin
exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    loan.status = 'rejected';
    loan.remarks = req.body.remarks || '';
    await loan.save();

    // Create notification
    await Notification.create({
      user: loan.user,
      message: `Your loan application for ₹${loan.amount} was rejected`,
      type: 'loan'
    });

    res.json({
      success: true,
      message: 'Loan rejected',
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Admin
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isVerified: true });
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: 'active' });
    const pendingLoans = await Loan.countDocuments({ status: 'pending' });
    
    const totalTransactions = await Transaction.countDocuments();
    const totalTransactionAmount = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingKYC = await User.countDocuments({ kycStatus: 'pending' });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalLoans,
        activeLoans,
        pendingLoans,
        totalTransactions,
        totalTransactionAmount: totalTransactionAmount[0]?.total || 0,
        pendingKYC
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get pending loans
// @route   GET /api/admin/loans/pending
// @access  Admin
exports.getPendingLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ status: 'pending' })
      .populate('user', 'name email balance')
      .sort({ appliedAt: -1 });

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
