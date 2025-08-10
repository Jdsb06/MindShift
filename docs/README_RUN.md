# 🚀 MindShift - Complete Run Guide

This guide will walk you through running the MindShift project step by step, explaining what each component does and how they work together.

## 📋 **Prerequisites**

Before running the project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git** (for version control)
- **Google Gemini API Key** (for AI features)

## 🏗️ **Project Structure**

```
MindShift/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/           # React components
│   │   ├── utils/           # Utility functions
│   │   └── firebase.js      # Firebase configuration
│   └── package.json
├── backend/                  # Firebase Cloud Functions
│   ├── index.js             # Cloud Functions code
│   ├── config.js            # API key configuration
│   └── package.json
├── firebase.json            # Firebase project configuration
├── firestore.rules          # Database security rules
└── firestore.indexes.json   # Database indexes
```

## 🔧 **Step-by-Step Setup**

### **Step 1: Clone and Navigate**
```bash
# Navigate to your project directory
cd /home/user/WebstormProjects/MindShift

# Verify you're in the right directory
ls -la
```

**What this does**: Sets up your working directory for the project.

### **Step 2: Install Frontend Dependencies**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

**What this does**: 
- Installs React, Vite, Tailwind CSS, and Firebase SDK
- Sets up the development environment for the frontend
- Creates `node_modules` with all required packages

### **Step 3: Install Backend Dependencies**
```bash
# Navigate to backend directory
cd ../backend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

**What this does**:
- Installs Firebase Functions, Admin SDK, and Gemini AI
- Sets up the serverless backend environment
- Prepares Cloud Functions for deployment

### **Step 4: Configure API Keys**
```bash
# Navigate to backend directory
cd backend

# Copy the example config file
cp config.example.js config.js

# Edit the config file with your API key
nano config.js
```

**What this does**:
- Sets up the Gemini AI API key for AI features
- Enables the "Generate My Vibe" functionality
- Required for AI summary generation

**Required Configuration**:
```javascript
// In backend/config.js
module.exports = {
  GEMINI_API_KEY: 'your-gemini-api-key-here'
};
```

### **Step 5: Configure Firebase**
```bash
# Navigate back to project root
cd ..

# Login to Firebase (if not already logged in)
firebase login

# Set project (if needed)
firebase use mindshift-206
```

**What this does**:
- Authenticates you with Firebase
- Connects to your Firebase project
- Enables deployment and emulator access

## 🚀 **Running the Project**

### **Option A: Development Mode (Recommended)**

#### **Step 1: Start Firebase Emulators**
```bash
# From project root directory
firebase emulators:start --only functions,firestore,auth
```

**What this does**:
- Starts local Firebase emulators
- Functions emulator on port 5001
- Firestore emulator on port 8081
- Auth emulator on port 9099
- Emulator UI on port 4001
- Provides local development environment

**Expected Output**:
```
i  emulators: Starting emulators: functions, firestore, auth
i  functions: Watching "backend" directory for changes...
i  firestore: Firestore Emulator running on port 8081
i  auth: Auth Emulator running on port 9099
i  ui: Emulator UI running on port 4001
```

#### **Step 2: Start Frontend Development Server**
```bash
# Open new terminal window/tab
cd frontend
npm run dev
```

**What this does**:
- Starts Vite development server
- Hot reload for development
- Serves React app on localhost:5173 (or 5174 if 5173 is busy)
- Connects to Firebase emulators automatically

**Expected Output**:
```
VITE v7.0.6  ready in 132 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### **Step 3: Access the Application**
- **Frontend**: http://localhost:5173 (or 5174)
- **Emulator UI**: http://localhost:4001
- **Functions**: http://localhost:5001
- **Firestore**: http://localhost:8081
- **Auth**: http://localhost:9099

### **Option B: Production Mode**

#### **Step 1: Deploy Backend**
```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

**What this does**:
- Deploys Cloud Functions to Firebase
- Sets up Firestore security rules
- Makes backend available in production

#### **Step 2: Build and Deploy Frontend**
```bash
# Build for production
cd frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**What this does**:
- Creates optimized production build
- Deploys to Firebase Hosting
- Makes app available at your Firebase domain

## 🧪 **Testing the Application**

### **Automated Testing**
1. **Open the app**: http://localhost:5173
2. **Sign up** for a new account
3. **Click "Test Functions 🧪"** button in header
4. **Check browser console** for test results

**What this tests**:
- ✅ Authentication (signup/login/logout)
- ✅ User profile creation
- ✅ Compass goals CRUD
- ✅ Momentum logs CRUD
- ✅ AI summary generation
- ✅ Real-time updates
- ✅ Error handling

### **Manual Testing**
1. **Authentication Flow**:
   - Sign up with email/password
   - Try Google sign-in
   - Test logout and login

2. **Compass Goals**:
   - Click "Edit Goals"
   - Update your 3 goals
   - Save and verify changes

3. **Momentum Logs**:
   - Add new accomplishments
   - Verify real-time updates
   - Delete log entries

4. **AI Magic**:
   - Add several momentum logs
   - Click "Generate My Vibe ✨"
   - Verify personalized summary

5. **Attention Swap**:
   - Click "Reset Focus ✨"
   - Follow breathing exercise
   - Test modal functionality

## 🔍 **Understanding Each Component**

### **Frontend (React + Vite)**
- **Technology**: React 18, Vite, Tailwind CSS
- **Purpose**: User interface and interactions
- **Port**: 5173 (development)
- **Features**: 
  - Responsive design (mobile/tablet/desktop)
  - Real-time data updates
  - Modern Gen Z UI/UX
  - Authentication flows

### **Backend (Firebase Cloud Functions)**
- **Technology**: Node.js 18, Firebase Functions
- **Purpose**: Serverless backend logic
- **Port**: 5001 (emulator)
- **Functions**:
  - `generateMomentumSummary`: AI-powered insights
  - `createUserProfile`: Automatic user setup

### **Database (Firestore)**
- **Technology**: Firebase Firestore
- **Purpose**: NoSQL database for user data
- **Port**: 8081 (emulator)
- **Collections**:
  - `users/{userId}`: User profiles and goals
  - `users/{userId}/momentumLogs`: User accomplishments

### **Authentication (Firebase Auth)**
- **Technology**: Firebase Authentication
- **Purpose**: User authentication and session management
- **Port**: 9099 (emulator)
- **Methods**: Email/password, Google OAuth

## 🛠️ **Troubleshooting**

### **Common Issues and Solutions**

#### **1. Authentication Connection Error**
```bash
# Error: "Unable to connect to localhost:9099"
# Solution: Start Auth emulator
firebase emulators:start --only functions,firestore,auth
```

#### **2. API Key Invalid Error**
```bash
# Error: "API key not valid. Please pass a valid API key"
# Solution: Configure Gemini API key
cd backend
cp config.example.js config.js
# Edit config.js with your API key
```

#### **3. Port Conflicts**
```bash
# If ports are busy, check what's using them
lsof -i :5173
lsof -i :8081
lsof -i :5001
lsof -i :9099

# Kill processes if needed
pkill -f firebase
pkill -f vite
```

#### **4. Emulator Connection Issues**
```bash
# Check emulator status
curl http://localhost:4001
curl http://localhost:5001
curl http://localhost:8081
curl http://localhost:9099

# Restart emulators with Auth
firebase emulators:start --only functions,firestore,auth
```

#### **5. Frontend Not Loading**
```bash
# Check if frontend is running
curl http://localhost:5173

# Restart frontend
cd frontend
npm run dev
```

#### **6. Firebase Configuration Issues**
```bash
# Check Firebase config
firebase projects:list
firebase use

# Re-login if needed
firebase logout
firebase login
```

#### **7. Dependencies Issues**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **Error Messages and Solutions**

| Error | Solution |
|-------|----------|
| `Unable to connect to localhost:9099` | Start Auth emulator: `firebase emulators:start --only functions,firestore,auth` |
| `API key not valid` | Configure Gemini API key in `backend/config.js` |
| `Port 8080 is not open` | Use port 8081 in firebase.json |
| `Missing script: "dev"` | Run from frontend directory |
| `Firebase not initialized` | Check emulator connections |
| `Function not found` | Deploy functions or check emulator |
| `Permission denied` | Check Firestore security rules |

## 📊 **Monitoring and Debugging**

### **Browser Developer Tools**
1. **Open DevTools**: F12 or right-click → Inspect
2. **Console Tab**: View test results and errors
3. **Network Tab**: Monitor API calls
4. **Application Tab**: Check Firebase connections

### **Firebase Emulator UI**
- **URL**: http://localhost:4001
- **Features**: 
  - View Firestore data
  - Monitor function calls
  - Check authentication
  - Export/import data

### **Logs and Debugging**
```bash
# View function logs
firebase functions:log

# View emulator logs
firebase emulators:start --only functions,firestore,auth --debug
```

## 🚀 **Deployment Checklist**

### **Before Deploying**
- [ ] All tests pass
- [ ] Emulators working locally
- [ ] Firebase project configured
- [ ] Gemini API key set in production
- [ ] Security rules tested

### **Production Deployment**
```bash
# Deploy everything
firebase deploy

# Or deploy specific parts
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

## 🎯 **Performance Benchmarks**

### **Expected Response Times**
- **Authentication**: < 2 seconds
- **Goal Updates**: < 1 second
- **Log Addition**: < 1 second
- **AI Summary**: < 5 seconds
- **Real-time Updates**: < 500ms

### **Success Indicators**
- ✅ Frontend loads without errors
- ✅ Authentication works
- ✅ CRUD operations successful
- ✅ Real-time updates working
- ✅ AI integration functional
- ✅ Responsive design working

## 📱 **Mobile Testing**

### **Responsive Design**
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### **Touch Testing**
- Swipe gestures work
- Buttons are touch-friendly (44px+)
- Text is readable on small screens
- Modals work on mobile

## 🎉 **Success Criteria**

Your MindShift app is running successfully when:

1. **Frontend loads** at http://localhost:5173
2. **All emulators are running** (check all ports)
3. **Authentication works** (signup/login)
4. **All CRUD operations** work (goals, logs)
5. **AI summary generates** personalized insights
6. **Real-time updates** work across devices
7. **Responsive design** works on all screen sizes
8. **Test suite passes** with 100% success rate

## 🔄 **Development Workflow**

### **Daily Development**
1. Start emulators: `firebase emulators:start --only functions,firestore,auth`
2. Start frontend: `cd frontend && npm run dev`
3. Make changes to code
4. Test changes in browser
5. Run tests: Click "Test Functions 🧪"
6. Commit changes to git

### **Before Committing**
- [ ] All tests pass
- [ ] Code runs without errors
- [ ] Responsive design works
- [ ] No console errors
- [ ] Functions work as expected
- [ ] Auth emulator included in startup

## 🔑 **API Key Setup**

### **Getting a Gemini API Key**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to `backend/config.js`
4. Restart the emulators

### **Config File Structure**
```javascript
// backend/config.js
module.exports = {
  GEMINI_API_KEY: 'your-actual-api-key-here'
};
```

---

**🎯 Your MindShift app is now ready to run and test!**

Follow these steps to get everything working, and you'll have a fully functional productivity app that helps users trade mindless scrolling for meaningful progress. ✨ 