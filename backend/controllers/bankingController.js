const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Make io accessible to controller
let io;
exports.setIO = (socketIO) => {
  io = socketIO;
};

// @desc    Get dashboard data
// @route   GET /api/banking/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Get recent transactions
    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .populate('sender', 'name email')
    .populate('receiver', 'name email');

    // Calculate total income (credits)
    const incomeTransactions = await Transaction.find({
      receiver: userId,
      status: 'success'
    });
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Calculate total expenses (debits and transfers)
    const expenseTransactions = await Transaction.find({
      sender: userId,
      status: 'success',
      type: { $in: ['debit', 'transfer'] }
    });
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        balance: user.balance,
        totalIncome,
        totalExpenses,
        recentTransactions: transactions,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Deposit money
// @route   POST /api/banking/deposit
// @access  Private
exports.depositMoney = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user._id;

    // Update user balance
    const user = await User.findById(userId);
    user.balance += amount;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      sender: userId, // Self-reference for deposits
      amount,
      type: 'credit',
      status: 'success',
      description: description || 'Deposit',
      balanceAfterTransaction: user.balance
    });

    // Create notification
    await Notification.create({
      user: userId,
      message: `₹${amount} deposited successfully`,
      type: 'transaction'
    });

    // Emit real-time update
    if (io) {
      io.to(`user_${userId}`).emit('balance_update', { newBalance: user.balance });
      io.to(`user_${userId}`).emit('new_transaction', { transaction });
      io.to(`user_${userId}`).emit('new_notification', { 
        message: `₹${amount} deposited successfully`,
        type: 'transaction'
      });
    }

    res.json({
      success: true,
      message: 'Deposit successful',
      data: { transaction, newBalance: user.balance }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Withdraw money
// @route   POST /api/banking/withdraw
// @access  Private
exports.withdrawMoney = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    // Check sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Update user balance
    user.balance -= amount;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      sender: userId,
      amount,
      type: 'debit',
      status: 'success',
      description: description || 'Withdrawal',
      balanceAfterTransaction: user.balance
    });

    // Create notification
    await Notification.create({
      user: userId,
      message: `₹${amount} withdrawn successfully`,
      type: 'transaction'
    });

    // Emit real-time update
    if (io) {
      io.to(`user_${userId}`).emit('balance_update', { newBalance: user.balance });
      io.to(`user_${userId}`).emit('new_transaction', { transaction });
    }

    res.json({
      success: true,
      message: 'Withdrawal successful',
      data: { transaction, newBalance: user.balance }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Transfer money
// @route   POST /api/banking/transfer
// @access  Private
exports.transferMoney = async (req, res) => {
  try {
    const { receiverId, amount, description } = req.body;
    const senderId = req.user._id;

    console.log('Transfer request:', { receiverId, amount, description, senderId });
    console.log('ReceiverId type:', typeof receiverId);
    console.log('SenderId type:', typeof senderId.toString());

    // Convert amount to number
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Check if receiver exists - ensure proper ObjectId conversion
    let receiver;
    try {
      const mongoose = require('mongoose');
      const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
      receiver = await User.findById(receiverObjectId);
    } catch (err) {
      console.error('Invalid ObjectId format:', err);
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID format'
      });
    }
    
    console.log('Receiver found:', receiver ? 'Yes - ' + receiver.name : 'No');
    
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found. Please check the User ID.'
      });
    }

    // Cannot transfer to self
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to yourself'
      });
    }

    const sender = await User.findById(senderId);
    console.log('Sender balance:', sender.balance, 'Transfer amount:', transferAmount);

    // Check sufficient balance
    if (sender.balance < transferAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Your balance: ₹${sender.balance.toLocaleString()}`
      });
    }

    // Fetch fresh receiver data to avoid stale data
    const freshReceiver = await User.findById(receiverId);
    
    // Update balances
    sender.balance -= transferAmount;
    freshReceiver.balance = (freshReceiver.balance || 0) + transferAmount;
    
    console.log('Before save - Sender:', sender.balance, 'Receiver:', freshReceiver.balance);
    
    await sender.save();
    await freshReceiver.save();
    
    console.log('After save - Sender:', sender.balance, 'Receiver:', freshReceiver.balance);

    // Create transaction record
    const transaction = await Transaction.create({
      sender: senderId,
      receiver: receiverId,
      amount: transferAmount,
      type: 'transfer',
      status: 'success',
      description: description || 'Money Transfer',
      balanceAfterTransaction: sender.balance // Sender's balance after transaction
    });

    console.log('Transaction created:', transaction._id);

    // Create notifications
    await Notification.create({
      user: senderId,
      message: `₹${transferAmount.toLocaleString('en-IN')} transferred to ${receiver.name}`,
      type: 'transaction'
    });

    await Notification.create({
      user: receiverId,
      message: `₹${transferAmount.toLocaleString('en-IN')} received from ${sender.name}`,
      type: 'transaction'
    });

    // Emit real-time updates to both sender and receiver
    if (io) {
      // Update sender
      io.to(`user_${senderId}`).emit('balance_update', { newBalance: sender.balance });
      io.to(`user_${senderId}`).emit('new_transaction', { 
        transaction: {
          ...transaction.toObject(),
          sender: { _id: senderId, name: sender.name },
          receiver: { _id: receiverId, name: receiver.name }
        }
      });
      
      // Update receiver
      io.to(`user_${receiverId}`).emit('balance_update', { newBalance: freshReceiver.balance });
      io.to(`user_${receiverId}`).emit('new_transaction', { 
        transaction: {
          ...transaction.toObject(),
          sender: { _id: senderId, name: sender.name },
          receiver: { _id: receiverId, name: receiver.name }
        }
      });
      
      console.log('Socket.io events emitted to both users');
    }

    res.json({
      success: true,
      message: 'Transfer successful',
      data: { transaction, newBalance: sender.balance }
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get transaction history
// @route   GET /api/banking/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type, status, search } = req.query;

    let query = {
      $or: [{ sender: userId }, { receiver: userId }]
    };

    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
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

// @desc    Delete a transaction
// @route   DELETE /api/banking/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is sender or receiver
    if (transaction.sender.toString() !== userId.toString() && 
        transaction.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this transaction'
      });
    }

    await Transaction.findByIdAndDelete(transactionId);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear all transactions for user
// @route   DELETE /api/banking/transactions
// @access  Private
exports.clearUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all transactions where user is sender or receiver
    const result = await Transaction.deleteMany({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    });

    console.log(`Cleared ${result.deletedCount} transactions for user ${userId}`);

    res.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} transactions`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
