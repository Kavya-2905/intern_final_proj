import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiDollarSign, FiCreditCard, FiFileText, FiPieChart, FiShield, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/transactions', icon: FiDollarSign, label: 'Transactions' },
    { path: '/cards', icon: FiCreditCard, label: 'Cards' },
    { path: '/loans', icon: FiFileText, label: 'Loans' },
    { path: '/kyc', icon: FiShield, label: 'KYC' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark w-full overflow-x-hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {sidebarOpen ? <FiX size={24} className="text-gray-900" /> : <FiMenu size={24} className="text-gray-900" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 lg:translate-x-0 shadow-sm"
      >
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MM Bank
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Welcome, {user?.name}</p>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 sm:px-6 py-3 transition-all text-sm sm:text-base ${
                  isActive
                    ? 'bg-primary/10 text-primary border-r-2 border-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:ml-64 w-full">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="ml-12 lg:ml-0">
              <h2 className="text-lg sm:text-xl font-semibold capitalize text-gray-900">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-600">Balance</p>
                <p className="text-base sm:text-lg font-bold text-primary">₹{user?.balance?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
