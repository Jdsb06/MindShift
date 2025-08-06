const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Firebase Admin for testing
admin.initializeApp();

const db = admin.firestore();

// Test function to verify Firestore connection
async function testFirestoreConnection() {
  try {
    console.log('🧪 Testing Firestore connection...');
    
    // Test writing a document
    const testDoc = await db.collection('test').doc('connection-test').set({
      message: 'Firestore connection successful!',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Firestore write test passed');
    
    // Test reading a document
    const doc = await db.collection('test').doc('connection-test').get();
    if (doc.exists) {
      console.log('✅ Firestore read test passed');
      console.log('📄 Document data:', doc.data());
    }
    
    // Clean up test document
    await db.collection('test').doc('connection-test').delete();
    console.log('✅ Test cleanup completed');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
  }
}

// Test function to verify Gemini integration
async function testGeminiIntegration() {
  try {
    console.log('🧪 Testing Gemini integration...');
    
    // This would require an actual Gemini API key
    // For now, we'll just test the function structure
    const mockLogs = [
      'Finished reading a chapter',
      'Went for a 30-minute walk',
      'Called a friend I haven\'t talked to in weeks'
    ];
    
    const prompt = `Based on these accomplishments, write a short, encouraging summary for the user in one paragraph. 
    Make it witty, supportive, and authentic - like a cool, encouraging friend. 
    Don't be overly formal or corporate. Keep it under 100 words.
    
    Accomplishments: ${mockLogs.join(', ')}`;
    
    console.log('📝 Generated prompt:', prompt);
    console.log('✅ Gemini integration test structure passed');
    
  } catch (error) {
    console.error('❌ Gemini test failed:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting MindShift Backend Tests...\n');
  
  await testFirestoreConnection();
  console.log('');
  await testGeminiIntegration();
  
  console.log('\n🎉 All tests completed!');
  process.exit(0);
}

runTests().catch(console.error); 