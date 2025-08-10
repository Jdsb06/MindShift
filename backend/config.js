// Configuration file for MindShift backend
// Copy this to config.js and fill in your actual values

module.exports = {
  // Gemini API Key (required for AI features). Prefer Functions config or env.
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  // Firebase Project Settings
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "mindshift-206",

  // Emulator settings for local development
  EMULATORS: {
    auth: 'localhost:9099',
    firestore: 'localhost:8081',
    functions: 'localhost:5001'
  }
};