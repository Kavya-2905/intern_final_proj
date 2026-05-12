import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bankingService } from '../services';
import { FiTrash2, FiRefreshCw, FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await bankingService.getTransactions({ limit: 50 });
      console.log('Transactions API Response:', response.data);
      console.log('Transactions Data:', response.data.data.transactions);
      if (response.data.data.transactions && response.data.data.transactions.length > 0) {
        console.log('First transaction:', response.data.data.transactions[0]);
      }
      setTransactions(response.data.data.transactions);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      setAlert({ type: 'error', message: 'Failed to load transactions' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all transaction history? This action cannot be undone.')) {
      return;
    }

    setClearing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/banking/transactions`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlert({ type: 'success', message: data.message || 'Transaction history cleared successfully' });
        fetchTransactions();
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to clear history' });
      }
    } catch (error) {
      console.error('Clear history error:', error);
      setAlert({ type: 'error', message: 'Failed to clear history' });
    } finally {
      setClearing(false);
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="space-y-6 w-full">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">{transactions.length} transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition disabled:opacity-50"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          {transactions.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
            >
              <FiTrash2 />
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {transactions.map((transaction, idx) => {
              // Get receiver and sender IDs (handle both populated objects and plain IDs)
              const receiverId = transaction.receiver?._id || transaction.receiver;
              const senderId = transaction.sender?._id || transaction.sender;
              
              // Determine if it's a credit (incoming) or debit (outgoing)
              const isCurrentUserReceiver = receiverId && receiverId.toString() === user?._id?.toString();
              const isCurrentUserSender = senderId && senderId.toString() === user?._id?.toString();
              
              // Green + for: credit type OR transfer received
              // Red - for: debit type OR withdrawal OR transfer sent
              const isIncoming = transaction.type === 'credit' || 
                                (transaction.type === 'transfer' && isCurrentUserReceiver);
              const isOutgoing = transaction.type === 'debit' || 
                                (transaction.type === 'transfer' && isCurrentUserSender);
              
              const amount = transaction.amount || 0;
              
              console.log(`Transaction ${idx}:`, {
                type: transaction.type,
                amount: transaction.amount,
                receiverId,
                senderId,
                userId: user?._id,
                isCurrentUserReceiver,
                isCurrentUserSender,
                isIncoming,
                isOutgoing
              });
              
              return (
                <motion.div
                  key={transaction._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  {/* Simple block layout - amount ALWAYS shows below details */}
                  <div>
                    {/* Icon and Title Row */}
                    <div className="flex items-center gap-3 mb-3">
                      {/* Transaction Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isIncoming 
                          ? 'bg-gradient-to-br from-green-400 to-green-600' 
                          : 'bg-gradient-to-br from-red-400 to-red-600'
                      }`}>
                        {isIncoming ? (
                          <FiArrowUpCircle className="text-white text-2xl" />
                        ) : (
                          <FiArrowDownCircle className="text-white text-2xl" />
                        )}
                      </div>

                      {/* Title */}
                      <p className="font-bold text-gray-900 text-lg">
                        {transaction.description || `${transaction.type} transaction`}
                      </p>
                    </div>

                    {/* Transaction ID */}
                    {transaction.transactionId && (
                      <p className="text-xs text-gray-500 font-mono mb-3">
                        ID: {transaction.transactionId}
                      </p>
                    )}

                    {/* Meta Info - Date, Type, Status */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                        {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        transaction.type === 'credit' ? 'bg-green-100 text-green-700' :
                        transaction.type === 'debit' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {transaction.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === 'success' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>

                    {/* Sender/Receiver */}
                    {(transaction.sender || transaction.receiver) && (
                      <div className="flex items-center gap-2 mb-4 text-sm">
                        {transaction.sender && (
                          <span className="text-gray-600">From: {transaction.sender.name || 'Unknown'}</span>
                        )}
                        {transaction.sender && transaction.receiver && (
                          <span className="text-gray-400">→</span>
                        )}
                        {transaction.receiver && (
                          <span className="text-gray-600">To: {transaction.receiver.name || 'Unknown'}</span>
                        )}
                      </div>
                    )}

                    {/* AMOUNT - Always shows at bottom with separator */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className={`text-3xl font-bold text-center ${
                        isIncoming ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isIncoming ? '+' : '-'} ₹{(amount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Balance After Transaction */}
                    {transaction.balanceAfterTransaction !== undefined && transaction.balanceAfterTransaction !== null && (
                      <div className="mt-3 text-sm text-gray-600 text-right">
                        Balance: ₹{(transaction.balanceAfterTransaction || 0).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200"
        >
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600">Your transaction history will appear here once you start banking</p>
        </motion.div>
      )}
    </div>
  );
};

export default Transactions;
