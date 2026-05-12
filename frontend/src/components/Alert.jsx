import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const Alert = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const typeClasses = {
    success: 'bg-green-500/20 border-green-500 text-green-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400'
  };

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`p-4 rounded-lg border ${typeClasses[type]} mb-4`}
      >
        <div className="flex justify-between items-center">
          <span>{message}</span>
          {onClose && (
            <button onClick={onClose} className="ml-4 text-lg font-bold">×</button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;
