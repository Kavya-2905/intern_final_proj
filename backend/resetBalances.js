require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const resetBalances = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Reset each user's balance to 200,000 if it's corrupted (too high or negative)
    for (const user of users) {
      const oldBalance = user.balance;
      
      // Check if balance is corrupted (too high - more than 1 crore or negative)
      if (oldBalance > 10000000 || oldBalance < 0) {
        console.log(`\nUser: ${user.name} (${user.email})`);
        console.log(`Old balance: ₹${oldBalance.toLocaleString()} - CORRUPTED`);
        
        // Reset to 200,000
        user.balance = 200000;
        await user.save();
        
        console.log(`New balance: ₹${user.balance.toLocaleString()} - RESET`);
      } else {
        console.log(`\nUser: ${user.name} - Balance OK: ₹${oldBalance.toLocaleString()}`);
      }
    }

    // Clear all corrupted transactions
    console.log('\n\nCleaning up corrupted transactions...');
    const deletedResult = await Transaction.deleteMany({
      $or: [
        { amount: { $gt: 10000000 } }, // Remove transactions with amounts > 1 crore
        { balanceAfterTransaction: { $gt: 10000000 } } // Remove transactions with corrupted balance
      ]
    });
    console.log(`Deleted ${deletedResult.deletedCount} corrupted transactions`);

    console.log('\n✅ Balance reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetBalances();
