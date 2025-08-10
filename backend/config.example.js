// Example configuration for MindShift backend
// Copy to config.js and fill in your values for local development as needed.

module.exports = {
  // Gemini API Key (required for AI features). Prefer Functions config or env.
  GEMINI_API_KEY: "",

  // Firebase Project Settings (optional for local dev)
  FIREBASE_PROJECT_ID: "mindshift-206",

  // Emulator settings for local development
  EMULATORS: {
    auth: 'localhost:9099',
    firestore: 'localhost:8081',
    functions: 'localhost:5001'
  }
};
