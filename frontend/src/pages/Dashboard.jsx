import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { bankingService } from '../services';
import { FiArrowUp, FiArrowDown, FiSend } from 'react-icons/fi';
import ChatBot from '../components/chatbot/ChatBot';
import Loader from '../components/Loader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    
    // Listen for real-time updates
    if (socket) {
      socket.on('balance_update', (data) => {
        console.log('Balance updated:', data.newBalance);
        setDashboardData(prev => ({
          ...prev,
          balance: data.newBalance
        }));
        updateUser({ balance: data.newBalance });
      });

      socket.on('new_transaction', (data) => {
        console.log('New transaction received:', data.transaction);
        // Refresh dashboard to show new transaction
        fetchDashboard();
      });
    }

    return () => {
      if (socket) {
        socket.off('balance_update');
        socket.off('new_transaction');
      }
    };
  }, [socket]);

  const fetchDashboard = async () => {
    try {
      const response = await bankingService.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl p-6 sm:p-8 text-white shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl -ml-24 -mb-24" />
        </div>
        
        <div className="relative z-10">
          <p className="text-white/80 text-sm sm:text-base mb-2 font-medium">Total Balance</p>
          <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8"
          >
            ₹{(dashboardData?.balance || user?.balance || 0).toLocaleString('en-IN')}
          </motion.h1>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                  <FiArrowUp className="text-green-300" />
                </div>
                <span className="text-white/80 text-xs sm:text-sm font-medium">Income</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                ₹{(dashboardData?.totalIncome || 0).toLocaleString('en-IN')}
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-400/20 rounded-full flex items-center justify-center">
                  <FiArrowDown className="text-red-300" />
                </div>
                <span className="text-white/80 text-xs sm:text-sm font-medium">Expenses</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                ₹{(dashboardData?.totalExpenses || 0).toLocaleString('en-IN')}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: 'Deposit', icon: FiArrowUp, color: 'from-green-500 to-emerald-600', path: '/dashboard/deposit', desc: 'Add money to account' },
          { label: 'Withdraw', icon: FiArrowDown, color: 'from-orange-500 to-red-600', path: '/dashboard/withdraw', desc: 'Withdraw funds' },
          { label: 'Transfer', icon: FiSend, color: 'from-primary to-secondary', path: '/dashboard/transfer', desc: 'Send money instantly' }
        ].map((action, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(action.path)}
            className="relative overflow-hidden bg-white rounded-2xl p-6 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 group"
          >
            {/* Gradient Background on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <action.icon size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300">{action.label}</h3>
              <p className="text-sm text-gray-600 mt-1 group-hover:text-white/90 transition-colors duration-300">{action.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-primary hover:text-secondary font-semibold text-sm">
            View All →
          </Link>
        </div>
        
        <div className="space-y-3">
          {dashboardData?.recentTransactions?.length > 0 ? (
            dashboardData.recentTransactions.slice(0, 5).map((transaction, idx) => {
              const isCredit = transaction.type === 'credit' || transaction.type === 'deposit';
              const amount = transaction.amount || 0;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCredit ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isCredit ? (
                        <FiArrowUp className="text-green-600 rotate-45" />
                      ) : (
                        <FiArrowDown className="text-red-600 rotate-45" />
                      )}
                    </div>
                    
                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {transaction.description || `${transaction.type} transaction`}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Amount */}
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className={`text-lg font-bold ${
                      isCredit ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCredit ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isCredit ? 'Credited' : 'Debited'}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No transactions yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* AI ChatBot */}
      <ChatBot />
    </div>
  );
};

export default Dashboard;
