const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
  },
  bankName: {
    type: String,
    enum: ['HDFC Bank', 'Bank of Baroda', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'],
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^[0-9]{8,19}$/, 'Card number must be between 8 to 19 digits']
  },
  cvv: {
    type: String,
    required: true,
    select: false
  },
  expiryDate: {
    type: String,
    required: true
  },
  cardHolderName: {
    type: String,
    required: true
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  spendingLimit: {
    type: Number,
    default: 10000
  },
  currentSpending: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Card', cardSchema);
