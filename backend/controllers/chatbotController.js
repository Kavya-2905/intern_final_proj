const OpenAI = require('openai');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const Card = require('../models/Card');

// Initialize OpenAI only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-proj-placeholder-key-replace-with-real-key') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Check if OpenAI is configured - if not, provide helpful banking responses
    if (!openai) {
      const user = await User.findById(userId);
      const lowerMessage = message.toLowerCase();
      let response = '';

      // Balance query - fetch from MongoDB
      if (lowerMessage.includes('balance') || lowerMessage.includes('money') || lowerMessage.includes('account')) {
        response = `Your current account balance is ₹${user.balance.toLocaleString('en-IN')}. You can view detailed transaction history in the Transactions section.`;
      }
      // Transaction query - fetch from MongoDB
      else if (lowerMessage.includes('transaction') || lowerMessage.includes('recent') || lowerMessage.includes('history')) {
        const recentTransactions = await Transaction.find({
          $or: [{ sender: userId }, { receiver: userId }]
        })
        .sort({ timestamp: -1 })
        .limit(5)
        .populate('sender', 'name')
        .populate('receiver', 'name');

        if (recentTransactions.length > 0) {
          response = `Here are your recent transactions:\n\n`;
          recentTransactions.forEach((tx, idx) => {
            const isCredit = tx.receiver?.toString() === userId.toString();
            const amount = tx.amount.toLocaleString('en-IN');
            const type = isCredit ? 'Credit' : 'Debit';
            response += `${idx + 1}. ${type}: ₹${amount} - ${tx.description || tx.type}\n`;
          });
          response += `\nView all transactions in the Transactions page.`;
        } else {
          response = 'You have no recent transactions. Start by making a deposit or transfer!';
        }
      }
      // Loan query - fetch from MongoDB
      else if (lowerMessage.includes('loan')) {
        const loans = await Loan.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
        
        if (loans.length > 0) {
          response = `You have ${loans.length} loan(s):\n\n`;
          loans.forEach((loan, idx) => {
            response += `${idx + 1}. ${loan.loanType || loan.type}: ₹${loan.amount.toLocaleString('en-IN')} - ${loan.status}\n`;
          });
        } else {
          response = 'You have no active loans. Visit the Loans section to apply for a new loan with competitive interest rates.';
        }
      }
      // Card query
      else if (lowerMessage.includes('card') || lowerMessage.includes('debit') || lowerMessage.includes('credit')) {
        const cards = await Card.find({ user: userId });
        
        if (cards.length > 0) {
          response = `You have ${cards.length} card(s) linked to your account. Manage them in the Cards section.`;
        } else {
          response = 'You have no cards added. Visit the Cards section to add your debit or credit cards from HDFC, SBI, ICICI, BOB, Axis, or PNB.';
        }
      }
      // KYC query - fetch from MongoDB
      else if (lowerMessage.includes('kyc') || lowerMessage.includes('verification')) {
        response = `Your KYC status is: ${user.kycStatus.toUpperCase()}. ${
          user.kycStatus === 'pending' ? 'Please upload your documents in the KYC section.' :
          user.kycStatus === 'verified' ? 'Your KYC is verified. You can access all banking features.' :
          'Your KYC was rejected. Please re-upload your documents.'
        }`;
      }
      // Transfer help
      else if (lowerMessage.includes('transfer') || lowerMessage.includes('send money')) {
        response = 'To transfer money, go to the Transfer page. You\'ll need the receiver\'s User ID (found in their Transfer page). Enter the amount and description, then click Transfer. The transfer happens instantly!';
      }
      // General greeting
      else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        response = `Hello ${user.name}! 👋 How can I help you today? I can assist with:\n\n• Checking your balance\n• Recent transactions\n• Loan information\n• Card details\n• KYC status\n\nJust ask!`;
      }
      // Help query
      else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        response = `I can help you with:\n\n` +
          `1️⃣ **Balance**: Ask "What is my balance?"\n` +
          `2️⃣ **Transactions**: Ask "Show recent transactions"\n` +
          `3️⃣ **Loans**: Ask "What are my loans?"\n` +
          `4️⃣ **Cards**: Ask "Show my cards"\n` +
          `5️⃣ **KYC**: Ask "What is my KYC status?"\n\n` +
          `I fetch live data from your MM Bank account!`;
      }
      // Default response
      else {
        response = `I understand you're asking about "${message}". While I'm still learning, I can help you with:\n\n` +
          `• Balance inquiries\n` +
          `• Transaction history\n` +
          `• Loan information\n` +
          `• Card management\n` +
          `• KYC verification\n\n` +
          `Please try asking about one of these topics!`;
      }

      return res.json({
        success: true,
        data: {
          response,
          timestamp: Date.now()
        }
      });
    }

    const user = await User.findById(userId);
    const recentTransactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ timestamp: -1 }).limit(5);
    
    const activeLoans = await Loan.find({ user: userId, status: 'active' });

    const userContext = `User: ${user.name}, Balance: ₹${user.balance}, KYC: ${user.kycStatus}`;

    const systemPrompt = `You are an AI banking assistant. Be professional and helpful. ${userContext}. Provide accurate banking information.`;

    let chatHistory = await ChatHistory.findOne({ user: userId });
    
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ user: userId, messages: [] });
    }

    chatHistory.messages.push({ role: 'user', content: message });

    if (chatHistory.messages.length > 20) {
      chatHistory.messages = chatHistory.messages.slice(-20);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory.messages.map(msg => ({ role: msg.role, content: msg.content }))
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    chatHistory.messages.push({ role: 'assistant', content: aiResponse });
    chatHistory.updatedAt = Date.now();
    await chatHistory.save();

    res.json({ success: true, data: { response: aiResponse, timestamp: Date.now() } });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.json({
      success: true,
      data: { response: "I'm experiencing technical difficulties. Please try again later.", timestamp: Date.now() }
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({ user: req.user._id });
    res.json({
      success: true,
      data: { messages: chatHistory ? chatHistory.messages : [] }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { user: req.user._id },
      { messages: [], updatedAt: Date.now() },
      { upsert: true }
    );
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
