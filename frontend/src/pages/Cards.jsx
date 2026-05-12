import { useState, useEffect } from 'react';
import { cardService } from '../services';
import Button from '../components/Button';
import Input from '../components/Input';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { motion } from 'framer-motion';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'debit',
    bankName: 'HDFC Bank',
    cardNumber: '',
    cvv: '',
    expiryDate: '',
    cardHolderName: ''
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await cardService.getCards();
      setCards(response.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load cards' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      await cardService.createCard(formData);
      setAlert({ type: 'success', message: 'Card added successfully!' });
      setShowForm(false);
      setFormData({
        type: 'debit',
        bankName: 'HDFC Bank',
        cardNumber: '',
        cvv: '',
        expiryDate: '',
        cardHolderName: ''
      });
      fetchCards();
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to add card' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleFreeze = async (cardId) => {
    try {
      await cardService.toggleFreeze(cardId);
      setAlert({ type: 'success', message: 'Card status updated' });
      fetchCards();
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to update card' });
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="flex gap-3 sm:gap-4">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Card'}
        </Button>
      </div>

      {showForm && (
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-xl font-bold mb-4">Enter Card Details</h3>
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Card Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                <option value="debit">Debit Card</option>
                <option value="credit">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bank Name</label>
              <select name="bankName" value={formData.bankName} onChange={handleChange} className="input-field">
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
              </select>
            </div>
            <Input label="Card Number" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="CVV" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="123" required />
              <Input label="Expiry Date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" required />
            </div>
            <Input label="Card Holder Name" name="cardHolderName" value={formData.cardHolderName} onChange={handleChange} placeholder="JOHN DOE" required />
            <Button type="submit" className="w-full">Add Card</Button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 card-gradient relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div>
                  <p className="text-white/80 text-xs sm:text-sm">{card.type?.toUpperCase()} CARD</p>
                  <p className="text-white font-semibold text-sm sm:text-lg">{card.bankName}</p>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-full text-white text-xs sm:text-sm capitalize">
                  {card.isFrozen ? 'Frozen' : 'Active'}
                </span>
              </div>

              <p className="text-white/90 text-base sm:text-lg tracking-wider mb-4 sm:mb-6 font-mono break-words">
                {card.cardNumber?.match(/.{1,4}/g)?.join(' ') || '**** **** **** ****'}
              </p>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-xs">Card Holder</p>
                  <p className="text-white font-semibold">{card.cardHolderName}</p>
                </div>
                <div>
                  <p className="text-white/80 text-xs">Expires</p>
                  <p className="text-white font-semibold">{card.expiryDate}</p>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full mt-6 bg-white/10 border-white/30"
                onClick={() => handleToggleFreeze(card._id)}
              >
                {card.isFrozen ? 'Unfreeze Card' : 'Freeze Card'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {cards.length === 0 && (
        <p className="text-center text-gray-400 py-12">No cards yet. Create one to get started!</p>
      )}
    </div>
  );
};

export default Cards;
