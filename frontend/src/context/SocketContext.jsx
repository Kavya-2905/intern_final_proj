import { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token }
    });

    newSocket.emit('join', user._id);

    newSocket.on('balance_update', (data) => {
      window.dispatchEvent(new CustomEvent('balance_update', { detail: data }));
    });

    newSocket.on('new_transaction', (data) => {
      window.dispatchEvent(new CustomEvent('new_transaction', { detail: data }));
    });

    newSocket.on('new_notification', (data) => {
      setNotifications(prev => [data, ...prev]);
      window.dispatchEvent(new CustomEvent('new_notification', { detail: data }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};
