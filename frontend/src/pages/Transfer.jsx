import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { bankingService } from '../services';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiUsers, FiHash } from 'react-icons/fi';
import Alert from '../components/Alert';

const Transfer = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    receiverId: '',
    amount: '',
    description: ''
  });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const navigate = useNavigate();

  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickAmount = (val) => {
    setFormData({ ...formData, amount: val.toString() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.receiverId) {
      return setAlert({ type: 'error', message: 'Please enter receiver User ID' });
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return setAlert({ type: 'error', message: 'Please enter a valid amount' });
    }

    if (parseFloat(formData.amount) > (user?.balance || 0)) {
      return setAlert({ 
        type: 'error', 
        message: `Insufficient balance. Your available balance is ₹${(user?.balance || 0).toLocaleString('en-IN')}` 
      });
    }

    if (formData.receiverId === user?._id) {
      return setAlert({ type: 'error', message: 'Cannot transfer to yourself' });
    }

    setShowConfirm(true);
  };

  const handleConfirmTransfer = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const transferData = {
        receiverId: formData.receiverId,
        amount: parseFloat(formData.amount),
        description: formData.description || 'Money Transfer'
      };
      
      const response = await bankingService.transfer(transferData);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Transfer failed. Please check the receiver ID and try again.' 
      });
    } finally {
      setLoading(false);
    }
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
              className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FiCheckCircle className="text-blue-600 text-4xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h3>
            <p className="text-gray-600 mb-4">Money has been sent successfully</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-blue-600 mb-6"
            >
              - ₹{parseFloat(formData.amount).toLocaleString('en-IN')}
            </motion.p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </motion.div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSend className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Transfer</h3>
              <p className="text-gray-600">Review the transfer details</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">To</p>
                <p className="text-sm font-mono text-gray-900 break-all">{formData.receiverId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-2xl font-bold text-blue-600">- ₹{parseFloat(formData.amount).toLocaleString('en-IN')}</p>
              </div>
              {formData.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-sm text-gray-900">{formData.description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Transfer Money</h1>
        <p className="text-gray-600 mt-2">Send money to another account instantly</p>
      </motion.div>

      {/* Your Balance & ID Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-xl"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Your Balance</p>
            <p className="text-3xl sm:text-4xl font-bold">₹{(user?.balance || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <FiSend className="text-2xl" />
          </div>
        </div>
        
        {/* User ID */}
        {user?._id && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs text-white/70 mb-1">Your User ID (Share to receive transfers)</p>
            <p className="text-sm font-mono text-white break-all">{user._id}</p>
          </div>
        )}
      </motion.div>

      {/* Transfer Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200"
      >
        <form onSubmit={handleSubmit}>
          {/* Receiver ID */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Receiver User ID
            </label>
            <div className="relative">
              <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                name="receiverId"
                value={formData.receiverId}
                onChange={handleChange}
                placeholder="Enter receiver's User ID"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-mono"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <FiAlertCircle /> Ask the receiver for their User ID from their profile
            </p>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transfer Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">₹</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                required
                min="1"
                max={user?.balance || 0}
                step="0.01"
              />
            </div>
            {parseFloat(formData.amount) > (user?.balance || 0) && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <FiAlertCircle /> Amount exceeds your balance
              </p>
            )}
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
                  disabled={val > (user?.balance || 0)}
                  className={`py-3 px-4 rounded-xl font-semibold transition ${
                    formData.amount === val.toString()
                      ? 'bg-blue-600 text-white shadow-lg'
                      : val > (user?.balance || 0)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ₹{(val / 1000).toFixed(0)}K
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
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Rent payment, Loan repayment"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiUsers className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Transfer Information</p>
                <p className="text-sm text-blue-700">
                  Money will be transferred instantly to the receiver's account. 
                  Both you and the receiver will see this transaction in your histories.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !formData.amount || !formData.receiverId || parseFloat(formData.amount) > (user?.balance || 0)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FiSend />
                Transfer ₹{formData.amount ? parseFloat(formData.amount).toLocaleString('en-IN') : '0'}
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Transfer;
