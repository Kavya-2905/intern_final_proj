const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB().catch(err => {
  console.error('MongoDB connection failed:', err.message);
  console.log('\n⚠️  IMPORTANT: MongoDB is not running!');
  console.log('\nTo fix this, you need to:');
  console.log('1. Install MongoDB from: https://www.mongodb.com/try/download/community');
  console.log('2. Start MongoDB service');
  console.log('3. Then restart this server\n');
  console.log('Alternatively, use MongoDB Atlas (cloud):');
  console.log('1. Create free account at: https://www.mongodb.com/cloud/atlas');
  console.log('2. Get your connection string');
  console.log('3. Update MONGO_URI in .env file\n');
});

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || '*'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to controllers
const bankingController = require('./controllers/bankingController');
bankingController.setIO(io);

// Initialize socket handlers
const socketHandler = require('./sockets');
socketHandler(io);

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || '*']
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Banking API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
