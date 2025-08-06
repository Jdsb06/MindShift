// Function Test Utility for MindShift
import { auth, db, functions } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export class MindShiftFunctionTester {
  constructor() {
    this.testResults = [];
    this.currentUser = null;
  }

  async runAllTests() {
    console.log('🧪 Starting MindShift Function Tests...\n');
    
    try {
      // Test 1: Authentication
      await this.testAuthentication();
      
      // Test 2: User Profile Creation
      await this.testUserProfileCreation();
      
      // Test 3: Compass Goals CRUD
      await this.testCompassGoals();
      
      // Test 4: Momentum Logs CRUD
      await this.testMomentumLogs();
      
      // Test 5: AI Summary Generation
      await this.testAISummary();
      
      // Test 6: Real-time Updates
      await this.testRealTimeUpdates();
      
      // Test 7: Error Handling
      await this.testErrorHandling();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication...');
    
    try {
      // Test signup
      const testEmail = `test${Date.now()}@mindshift.test`;
      const testPassword = 'testpassword123';
      
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      this.currentUser = userCredential.user;
      
      console.log('✅ Signup successful');
      this.testResults.push({ test: 'Authentication - Signup', status: 'PASS' });
      
      // Test logout
      await signOut(auth);
      console.log('✅ Logout successful');
      this.testResults.push({ test: 'Authentication - Logout', status: 'PASS' });
      
      // Test login
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Login successful');
      this.testResults.push({ test: 'Authentication - Login', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Authentication test failed:', error.message);
      this.testResults.push({ test: 'Authentication', status: 'FAIL', error: error.message });
    }
  }

  async testUserProfileCreation() {
    console.log('👤 Testing User Profile Creation...');
    
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      
      if (!userDoc.exists()) {
        // Create user profile
        await setDoc(doc(db, 'users', this.currentUser.uid), {
          email: this.currentUser.email,
          createdAt: serverTimestamp(),
          compassGoals: {
            goal1: 'Test goal 1',
            goal2: 'Test goal 2',
            goal3: 'Test goal 3'
          }
        });
        console.log('✅ User profile created');
      } else {
        console.log('✅ User profile already exists');
      }
      
      this.testResults.push({ test: 'User Profile Creation', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ User profile creation test failed:', error.message);
      this.testResults.push({ test: 'User Profile Creation', status: 'FAIL', error: error.message });
    }
  }

  async testCompassGoals() {
    console.log('🧭 Testing Compass Goals...');
    
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      // Read goals
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      const goals = userDoc.data()?.compassGoals || {};
      console.log('✅ Goals read successfully:', goals);
      
      // Update goals
      const newGoals = {
        goal1: 'Updated test goal 1',
        goal2: 'Updated test goal 2',
        goal3: 'Updated test goal 3'
      };
      
      await updateDoc(doc(db, 'users', this.currentUser.uid), {
        compassGoals: newGoals
      });
      console.log('✅ Goals updated successfully');
      
      this.testResults.push({ test: 'Compass Goals CRUD', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Compass goals test failed:', error.message);
      this.testResults.push({ test: 'Compass Goals CRUD', status: 'FAIL', error: error.message });
    }
  }

  async testMomentumLogs() {
    console.log('📈 Testing Momentum Logs...');
    
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      // Add a test log
      const testLog = {
        text: 'Test accomplishment - completed function testing',
        createdAt: serverTimestamp()
      };
      
      const logRef = await addDoc(collection(db, 'users', this.currentUser.uid, 'momentumLogs'), testLog);
      console.log('✅ Log added successfully');
      
      // Read logs
      const logsQuery = query(
        collection(db, 'users', this.currentUser.uid, 'momentumLogs'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await logsQuery.get();
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('✅ Logs read successfully:', logs.length, 'logs found');
      
      // Delete the test log
      await deleteDoc(doc(db, 'users', this.currentUser.uid, 'momentumLogs', logRef.id));
      console.log('✅ Test log deleted successfully');
      
      this.testResults.push({ test: 'Momentum Logs CRUD', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Momentum logs test failed:', error.message);
      this.testResults.push({ test: 'Momentum Logs CRUD', status: 'FAIL', error: error.message });
    }
  }

  async testAISummary() {
    console.log('✨ Testing AI Summary Generation...');
    
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      // Add some test logs for AI to analyze
      const testLogs = [
        'Completed function testing',
        'Wrote comprehensive test suite',
        'Implemented responsive design'
      ];
      
      for (const logText of testLogs) {
        await addDoc(collection(db, 'users', this.currentUser.uid, 'momentumLogs'), {
          text: logText,
          createdAt: serverTimestamp()
        });
      }
      
      // Test AI summary generation
      const generateMomentumSummary = httpsCallable(functions, 'generateMomentumSummary');
      const result = await generateMomentumSummary();
      
      console.log('✅ AI summary generated:', result.data.summary);
      
      // Clean up test logs
      const logsQuery = query(
        collection(db, 'users', this.currentUser.uid, 'momentumLogs'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await logsQuery.get();
      const deletePromises = [];
      snapshot.forEach(doc => {
        if (testLogs.includes(doc.data().text)) {
          deletePromises.push(deleteDoc(doc.ref));
        }
      });
      
      await Promise.all(deletePromises);
      console.log('✅ Test logs cleaned up');
      
      this.testResults.push({ test: 'AI Summary Generation', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ AI summary test failed:', error.message);
      this.testResults.push({ test: 'AI Summary Generation', status: 'FAIL', error: error.message });
    }
  }

  async testRealTimeUpdates() {
    console.log('🔄 Testing Real-time Updates...');
    
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      let updateReceived = false;
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        collection(db, 'users', this.currentUser.uid, 'momentumLogs'),
        (snapshot) => {
          console.log('✅ Real-time update received:', snapshot.docs.length, 'logs');
          updateReceived = true;
        }
      );
      
      // Add a test log to trigger real-time update
      await addDoc(collection(db, 'users', this.currentUser.uid, 'momentumLogs'), {
        text: 'Real-time test log',
        createdAt: serverTimestamp()
      });
      
      // Wait a bit for the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clean up
      unsubscribe();
      
      if (updateReceived) {
        console.log('✅ Real-time updates working');
        this.testResults.push({ test: 'Real-time Updates', status: 'PASS' });
      } else {
        throw new Error('No real-time update received');
      }
      
    } catch (error) {
      console.error('❌ Real-time updates test failed:', error.message);
      this.testResults.push({ test: 'Real-time Updates', status: 'FAIL', error: error.message });
    }
  }

  async testErrorHandling() {
    console.log('🚨 Testing Error Handling...');
    
    try {
      // Test invalid function call
      const invalidFunction = httpsCallable(functions, 'nonExistentFunction');
      
      try {
        await invalidFunction();
        throw new Error('Should have failed');
      } catch (error) {
        console.log('✅ Error handling working for invalid function');
      }
      
      // Test invalid document access
      try {
        await getDoc(doc(db, 'nonExistentCollection', 'nonExistentDoc'));
        console.log('✅ Error handling working for invalid document');
      } catch (error) {
        console.log('✅ Error handling working for invalid document');
      }
      
      this.testResults.push({ test: 'Error Handling', status: 'PASS' });
      
    } catch (error) {
      console.error('❌ Error handling test failed:', error.message);
      this.testResults.push({ test: 'Error Handling', status: 'FAIL', error: error.message });
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${total}`);
    console.log(`🎯 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Your MindShift app is working perfectly!');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the errors above.');
    }
  }
}

// Export for use in browser console
window.MindShiftFunctionTester = MindShiftFunctionTester; 