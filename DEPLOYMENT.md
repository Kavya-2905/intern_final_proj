# 🚀 MM Bank - Deployment Guide

This guide will help you deploy your MM Bank application to:
- **Frontend**: Vercel
- **Backend**: Railway or Render

---

## 📋 **Prerequisites**

1. GitHub account
2. Vercel account (free)
3. Railway or Render account (free tier available)
4. MongoDB Atlas account (already set up)

---

## 🎯 **Step-by-Step Deployment**

### **PART 1: Push Code to GitHub**

```bash
# Navigate to your project
cd c:\Users\Dell\Desktop\final_proj

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - MM Bank ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/mm-bank.git
git branch -M main
git push -u origin main
```

---

### **PART 2: Deploy Backend (Railway)**

#### **Option A: Railway (Recommended)**

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select your repository**: `mm-bank`
5. **Select the backend folder**

6. **Add Environment Variables** in Railway Dashboard:
   ```
   PORT=5000
   MONGO_URI=<Your MongoDB Atlas URI>
   JWT_SECRET=<Generate a strong secret: use https://generate-secret.vercel.app/32>
   NODE_ENV=production
   ```

7. **Railway will automatically**:
   - Detect Node.js
   - Run `npm install`
   - Start with `node server.js`

8. **Get your Railway URL**:
   - Go to Settings → Domains
   - Copy the URL (e.g., `https://mm-bank-production.up.railway.app`)

#### **Option B: Render**

1. **Go to Render**: https://render.com
2. **Sign in** with GitHub
3. **Click "New"** → **"Web Service"**
4. **Connect your repository**
5. **Configure**:
   - **Name**: `mm-bank-backend`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Environment Variables**: Same as Railway above

6. **Deploy** and get your URL

---

### **PART 3: Deploy Frontend (Vercel)**

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import your repository**: `mm-bank`

5. **Configure Build Settings**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

6. **Add Environment Variable**:
   ```
   VITE_API_URL=<Your Railway/Render Backend URL>
   Example: https://mm-bank-production.up.railway.app
   ```

7. **Click "Deploy"**

8. **Vercel will give you a URL**:
   - Example: `https://mm-bank.vercel.app`

---

### **PART 4: Update CORS in Backend**

After deployment, update your backend to allow your Vercel domain:

**In `backend/server.js`**, update CORS:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',           // Local development
    'https://mm-bank.vercel.app',       // Your Vercel URL
    'https://mm-bank-*.vercel.app',     // Vercel preview URLs
  ],
  credentials: true
}));
```

---

### **PART 5: Update Frontend API URL**

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=https://mm-bank-production.up.railway.app
```

---

## ✅ **Post-Deployment Checklist**

### **Backend:**
- [ ] Environment variables set
- [ ] MongoDB Atlas connected
- [ ] CORS configured with Vercel domain
- [ ] Server running without errors
- [ ] API endpoints accessible (test with Postman)

### **Frontend:**
- [ ] Environment variable `VITE_API_URL` set
- [ ] Build successful
- [ ] All pages loading correctly
- [ ] Login/Signup working
- [ ] API calls reaching backend
- [ ] Real-time updates working (Socket.io)

---

## 🔧 **Common Issues & Solutions**

### **Issue 1: CORS Error**
**Problem**: Frontend can't reach backend
**Solution**: 
- Add Vercel domain to backend CORS
- Check `VITE_API_URL` is correct

### **Issue 2: Socket.io Connection Failed**
**Problem**: Real-time updates not working
**Solution**:
```javascript
// In frontend SocketContext.jsx
const socket = io(process.env.VITE_API_URL || 'http://localhost:5000', {
  transports: ['websocket', 'polling']
});
```

### **Issue 3: Build Fails on Vercel**
**Problem**: `npm run build` fails
**Solution**:
- Check for console.log errors
- Ensure all dependencies in `package.json`
- Check `VITE_API_URL` is set

### **Issue 4: MongoDB Connection Error**
**Problem**: Backend can't connect to MongoDB
**Solution**:
- Check `MONGO_URI` environment variable
- Ensure MongoDB Atlas allows Railway/Render IP
- Whitelist `0.0.0.0/0` in MongoDB Atlas (all IPs)

---

## 🎉 **Your Deployed App**

After successful deployment:
- **Frontend**: `https://mm-bank.vercel.app`
- **Backend**: `https://mm-bank-production.up.railway.app`
- **Database**: MongoDB Atlas (Cloud)

---

## 📝 **Quick Reference Commands**

```bash
# Local Development
cd backend && npm start          # Backend on port 5000
cd frontend && npm run dev       # Frontend on port 3000

# Build for Production
cd frontend && npm run build

# Check Backend Logs (Railway)
railway logs

# Check Frontend Logs (Vercel)
vercel logs
```

---

## 🔐 **Security Best Practices**

1. **Never commit `.env` files** to GitHub
2. **Use strong JWT_SECRET** (32+ characters)
3. **Enable MongoDB Atlas IP whitelist** (only Railway IP)
4. **Use HTTPS** (Vercel and Railway provide this automatically)
5. **Keep dependencies updated**: `npm audit`

---

## 🆘 **Need Help?**

If you encounter issues:
1. Check browser console (F12)
2. Check Railway/Render logs
3. Check Vercel deployment logs
4. Test backend API with Postman
5. Verify environment variables are set

---

## 🎊 **Congratulations!**

Your MM Bank is now live and accessible worldwide! 🌍

Share your app:
- `https://mm-bank.vercel.app`

Enjoy your deployed banking application! 🚀💰
