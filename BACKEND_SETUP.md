# MindShift Backend Setup Guide

This guide will help you set up the Firebase backend for the MindShift app.

## Prerequisites

1. **Node.js 18+** installed
2. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

## Setup Steps

### 1. Firebase Project Setup

1. **Create a Firebase project:**
   ```bash
   firebase login
   firebase projects:create mindshift-app
   ```

2. **Initialize Firebase in the project:**
   ```bash
   firebase init
   ```
   - Select: Functions, Firestore, Hosting
   - Choose your project: `mindshift-206`
   - Use existing project
   - Language: JavaScript
   - ESLint: Yes
   - Install dependencies: Yes

### 2. Environment Configuration

1. **Set up Gemini API key:**
   ```bash
   firebase functions:config:set gemini.key="your-gemini-api-key"
   ```

2. **Update frontend Firebase config:**
   - Go to Firebase Console → Project Settings → General
   - Copy the config object
   - Update `frontend/src/firebase.js` with your actual config

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Deploy to Firebase

```bash
# Deploy functions
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy
```

## Development

### Run Emulators Locally

```bash
firebase emulators:start
```

This will start:
- Functions emulator on port 5001
- Firestore emulator on port 8080
- Auth emulator on port 9099
- Emulator UI on port 4000

### Available Cloud Functions

1. **`generateMomentumSummary`** - Creates personalized summaries of user accomplishments using Gemini AI
2. **`createUserProfile`** - Automatically creates user profile on signup

## Data Structure

### Users Collection
```
/users/{userId}
{
  email: string,
  createdAt: timestamp,
  compassGoals: {
    goal1: string,
    goal2: string,
    goal3: string
  }
}
```

### Momentum Logs Subcollection
```
/users/{userId}/momentumLogs/{logId}
{
  text: string,
  createdAt: timestamp
}
```

## Security Rules

The Firestore security rules ensure:
- Users can only access their own data
- Authentication is required for all operations
- Users can only read/write their own momentum logs

## Troubleshooting

### Common Issues

1. **Functions not deploying:**
   - Check Node.js version (must be 18+)
   - Ensure all dependencies are installed

2. **Emulator connection issues:**
   - Make sure emulators are running
   - Check port configurations in `firebase.json`

3. **Gemini API errors:**
   - Verify API key is set correctly
   - Check Google AI Studio account has sufficient credits

### Useful Commands

```bash
# View function logs
firebase functions:log

# Test functions locally
firebase emulators:start --only functions

# Deploy specific function
firebase deploy --only functions:generateMomentumSummary
``` 