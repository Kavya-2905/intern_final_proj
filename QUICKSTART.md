# Quick Start Guide

## Step 1: Install MongoDB
Make sure MongoDB is installed and running on your system.

**Windows:**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install and start the service: `net start MongoDB`

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo service mongodb start
```

## Step 2: Setup Backend

```bash
cd backend
npm install
```

**IMPORTANT**: Edit `backend/.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Start backend:
```bash
npm start
```

Backend runs on: http://localhost:5000

## Step 3: Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

## Step 4: Use the Application

1. Go to http://localhost:3000
2. Click "Sign Up" to create an account
3. Login with your credentials
4. Start using the banking features!

## Features to Try

✅ **Dashboard** - View balance and analytics
✅ **Deposit** - Add money to your account
✅ **Withdraw** - Withdraw money
✅ **Transfer** - Send money to another user (create 2 accounts to test)
✅ **Cards** - Create debit/credit cards
✅ **Loans** - Calculate EMI and apply for loans
✅ **KYC** - Upload verification documents
✅ **AI Chatbot** - Click the floating button to chat with AI assistant

## Testing Transfers

To test money transfers:
1. Create User A account
2. Create User B account
3. Deposit money to User A
4. Get User B's User ID from their profile
5. Transfer from User A to User B using User B's ID

## Troubleshooting

**MongoDB not connecting?**
- Check if MongoDB is running
- Verify MONGO_URI in backend/.env

**Port already in use?**
- Kill the process using the port
- Or change the port in .env files

**OpenAI not working?**
- Verify API key is correct
- Check if you have credits in your OpenAI account

**Frontend not loading?**
- Check if backend is running
- Check browser console for errors

## Need Help?

Check the main README.md for detailed documentation.
