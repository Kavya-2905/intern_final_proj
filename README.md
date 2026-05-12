# AI-Powered Digital Banking Platform

A complete production-quality AI-powered digital banking web application built with React.js, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, Socket.io, and OpenAI integration.

## Features

- **Authentication System**: Login, signup, JWT authentication, password hashing
- **Banking Dashboard**: Real-time balance updates, analytics, transaction history
- **Transaction Management**: Deposit, withdraw, transfer money with real-time updates
- **AI Chatbot Assistant**: OpenAI-powered banking assistant with context awareness
- **Card Management**: Create debit/credit cards, freeze/unfreeze, spending limits
- **Loan Management**: EMI calculator, loan applications, eligibility checking
- **KYC Verification**: Document upload and verification system
- **Real-time Updates**: Socket.io for instant balance and transaction updates
- **Modern UI**: Glassmorphism design, Framer Motion animations, fully responsive

## Tech Stack

### Frontend
- React.js 18
- Vite
- Tailwind CSS
- Framer Motion
- React Icons
- Recharts
- Socket.io-client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- Socket.io
- OpenAI API
- Multer (file uploads)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API Key

## Installation & Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already provided):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-bank-system
JWT_SECRET=banksecretkey2026secure
OPENAI_API_KEY=your_openai_api_key_here
```

4. **IMPORTANT**: Add your OpenAI API key to the `.env` file

5. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## MongoDB Setup

Make sure MongoDB is running locally on your machine:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**Mac/Linux:**
```bash
mongod
```

The application will automatically connect to: `mongodb://127.0.0.1:27017/ai-bank-system`

## Usage

1. **Create an Account**: Go to `http://localhost:3000/signup` and register
2. **Login**: Use your credentials to login
3. **Dashboard**: View your balance, income, expenses, and recent transactions
4. **Deposit Money**: Add funds to your account
5. **Transfer Money**: Send money to other users (need their User ID)
6. **AI Chatbot**: Click the floating chat button to interact with the AI assistant
7. **Cards**: Create and manage your debit/credit cards
8. **Loans**: Calculate EMI and apply for loans
9. **KYC**: Upload verification documents

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Banking
- `GET /api/banking/dashboard` - Get dashboard data
- `POST /api/banking/deposit` - Deposit money
- `POST /api/banking/withdraw` - Withdraw money
- `POST /api/banking/transfer` - Transfer money
- `GET /api/banking/transactions` - Get transaction history

### Cards
- `GET /api/cards` - Get user's cards
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id/toggle-freeze` - Freeze/unfreeze card

### Loans
- `GET /api/loans` - Get user's loans
- `POST /api/loans/apply` - Apply for loan
- `POST /api/loans/calculate-emi` - Calculate EMI

### Chatbot
- `POST /api/chatbot/message` - Send message to AI
- `GET /api/chatbot/history` - Get chat history

## Project Structure

```
final_proj/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── models/          # Mongoose schemas
│   ├── config/          # Database config
│   ├── sockets/         # Socket.io handlers
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── layouts/         # Layout wrappers
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── App.jsx          # Main app component
│   └── index.html
└── README.md
```

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Input validation
- CORS configuration
- Secure file uploads

## Real-time Features

Socket.io enables:
- Instant balance updates
- Live transaction notifications
- Real-time dashboard refresh
- Instant transfer confirmations

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `net start MongoDB` (Windows) or `mongod` (Mac/Linux)

**Port Already in Use:**
- Change PORT in backend/.env
- Change port in frontend/vite.config.js

**OpenAI API Error:**
- Verify your API key in backend/.env
- Check OpenAI account credits

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using React, Node.js, and AI
