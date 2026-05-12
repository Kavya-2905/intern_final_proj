const express = require('express');
const router = express.Router();
const { getCards, createCard, toggleFreeze, updateLimit } = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCards);
router.post('/', protect, createCard);
router.put('/:id/toggle-freeze', protect, toggleFreeze);
router.put('/:id/limit', protect, updateLimit);

module.exports = router;
