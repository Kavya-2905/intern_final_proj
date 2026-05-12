const Card = require('../models/Card');
const User = require('../models/User');
const { generateCardNumber, generateCVV, generateExpiryDate } = require('../utils/cardGenerator');

// @desc    Get user's cards
// @route   GET /api/cards
// @access  Private
exports.getCards = async (req, res) => {
  try {
    const userId = req.user._id;
    const cards = await Card.find({ user: userId });

    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a new card
// @route   POST /api/cards
// @access  Private
exports.createCard = async (req, res) => {
  try {
    const { type, bankName, cardNumber, cvv, expiryDate, cardHolderName } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!bankName || !cardNumber || !cvv || !expiryDate || !cardHolderName) {
      return res.status(400).json({
        success: false,
        message: 'All card details are required'
      });
    }

    const card = await Card.create({
      user: userId,
      type,
      bankName,
      cardNumber,
      cvv,
      expiryDate,
      cardHolderName: cardHolderName.toUpperCase()
    });

    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Freeze/unfreeze card
// @route   PUT /api/cards/:id/toggle-freeze
// @access  Private
exports.toggleFreeze = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check if card belongs to user
    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    card.isFrozen = !card.isFrozen;
    await card.save();

    res.json({
      success: true,
      message: `Card ${card.isFrozen ? 'frozen' : 'unfrozen'} successfully`,
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update card spending limit
// @route   PUT /api/cards/:id/limit
// @access  Private
exports.updateLimit = async (req, res) => {
  try {
    const { spendingLimit } = req.body;
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check if card belongs to user
    if (card.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    card.spendingLimit = spendingLimit;
    await card.save();

    res.json({
      success: true,
      message: 'Spending limit updated',
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
