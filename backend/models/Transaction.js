const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  description: {
    type: String,
    trim: true
  },
  balanceAfterTransaction: {
    type: Number,
    default: 0
  },
  transactionId: {
    type: String,
    unique: true,
    default: () => `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ sender: 1, timestamp: -1 });
transactionSchema.index({ receiver: 1, timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
