# MongoDB Setup Guide - FIX NETWORK ERROR

## ⚠️ The Issue
The "network error" occurs because **MongoDB is not installed or not running** on your system.

---

## 🔧 SOLUTION 1: Install MongoDB Locally (Recommended for Development)

### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (8.0 or higher)
   - Platform: Windows
   - Package: msi
3. Click **Download**

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. **IMPORTANT**: Check "Install MongoDB as a Service"
4. Check "Run service as Network Service user"
5. Complete the installation

### Step 3: Verify MongoDB is Running
Open PowerShell and run:
```powershell
net start MongoDB
```

You should see: "The MongoDB Server service is starting."

### Step 4: Restart Backend
```powershell
cd c:\Users\Dell\Desktop\final_proj\backend
npm start
```

You should now see: "MongoDB Connected: 127.0.0.1"

---

## ☁️ SOLUTION 2: Use MongoDB Atlas (FREE Cloud Database)

If you don't want to install MongoDB locally, use the free cloud version:

### Step 1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select a region close to you
4. Click "Create"

### Step 3: Setup Access
1. **Create Database User**:
   - Username: `admin`
   - Password: (create a strong password)
   - Click "Create User"

2. **Whitelist IP**:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

### Step 4: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

4. Replace `<password>` with your actual password

### Step 5: Update Backend .env
Edit `backend/.env`:
```env
MONGO_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ai-bank-system?retryWrites=true&w=majority
```

### Step 6: Restart Backend
```powershell
cd c:\Users\Dell\Desktop\final_proj\backend
npm start
```

---

## ✅ Verify Connection

After setting up MongoDB, you should see:
```
Server running in undefined mode on port 5000
MongoDB Connected: 127.0.0.1  (or your Atlas URL)
```

---

## 🚀 Quick Test

Once MongoDB is connected:
1. Frontend: http://localhost:3000
2. Click "Sign Up"
3. Create an account
4. You should NO LONGER see network errors!

---

## 📝 Common Issues

**Issue**: "MongoDB service not found"
**Fix**: MongoDB isn't installed. Use Solution 1 or 2 above.

**Issue**: "Authentication failed"
**Fix**: Check your MONGO_URI in .env file has correct password.

**Issue**: "Network error" on frontend
**Fix**: Make sure BOTH servers are running:
- Backend: `npm start` (in backend folder)
- Frontend: `npm run dev` (in frontend folder)

---

## 🎯 Recommended For You

**For quick testing**: Use MongoDB Atlas (Solution 2) - takes 5 minutes
**For development**: Install MongoDB locally (Solution 1) - faster, no internet needed

---

Need more help? Check the error message in your backend terminal and share it!
