import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { chatbotService } from '../../services';
import Loader from '../Loader';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(input);
      const botMessage = {
        role: 'assistant',
        content: response.data.data.response,
        timestamp: response.data.data.timestamp
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    'What is my balance?',
    'Show recent transactions',
    'How can I apply for a loan?'
  ];

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-xl transition-shadow border-2 border-white/20"
      >
        {isOpen ? <FiX size={28} className="text-white" /> : <FiMessageSquare size={28} className="text-white" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-[90vw] sm:w-96 h-[500px] sm:h-[600px] bg-gray-50 border-2 border-gray-300 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-primary to-secondary border-b border-white/10">
              <h3 className="text-lg font-bold text-white">MM Bank AI Assistant</h3>
              <p className="text-xs text-white/80">Online - Ready to help</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center mt-8">
                  <p className="mb-4 text-gray-900 font-semibold text-lg">How can I help you today?</p>
                  <div className="space-y-2">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(action)}
                        className="block w-full text-sm p-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-primary/10 hover:border-primary transition text-gray-900 font-medium shadow-sm"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'bg-dark-light text-gray-900 border border-gray-300'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
                    <Loader size="sm" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="p-3 bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg transition disabled:opacity-50 text-white"
                >
                  <FiSend size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
