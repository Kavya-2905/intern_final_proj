import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { bankingService } from '../services';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import Alert from '../components/Alert';

const Deposit = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      return setAlert({ type: 'error', message: 'Please enter a valid amount' });
    }

    setLoading(true);
    try {
      await bankingService.deposit({ 
        amount: parseFloat(amount), 
        description: description || 'Cash Deposit' 
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Deposit failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (val) => {
    setAmount(val.toString());
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      {/* Success Modal */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FiCheckCircle className="text-green-600 text-4xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Deposit Successful!</h3>
            <p className="text-gray-600 mb-4">Your money has been added successfully</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-green-600 mb-6"
            >
              + ₹{parseFloat(amount).toLocaleString('en-IN')}
            </motion.p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </motion.div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition mb-4"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Deposit Money</h1>
        <p className="text-gray-600 mt-2">Add funds to your account instantly</p>
      </motion.div>

      {/* Current Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white mb-6 shadow-xl"
      >
        <p className="text-white/80 text-sm mb-1">Current Balance</p>
        <p className="text-3xl sm:text-4xl font-bold">₹{(user?.balance || 0).toLocaleString('en-IN')}</p>
      </motion.div>

      {/* Deposit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200"
      >
        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deposit Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                required
                min="1"
                step="0.01"
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Quick Amounts
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className={`py-3 px-4 rounded-xl font-semibold transition ${
                    amount === val.toString()
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ₹{(val / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
                { id: 'upi', label: 'UPI Payment', icon: '📱' },
                { id: 'card', label: 'Debit Card', icon: '' },
                { id: 'cash', label: 'Cash', icon: '💵' }
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                    paymentMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium text-gray-700">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Salary, Business payment"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Important</p>
                <p className="text-sm text-blue-700">
                  Deposited amount will be added to your account balance immediately. 
                  All transactions are recorded in your transaction history.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !amount}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FiDollarSign />
                Deposit ₹{amount ? parseFloat(amount).toLocaleString('en-IN') : '0'}
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Deposit;
