const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(
  config.GEMINI_API_KEY || functions.config().gemini?.key || process.env.GEMINI_API_KEY
);

const db = admin.firestore();

/**
 * Generate Momentum Summary Cloud Function
 * Creates a personalized, encouraging summary of user's recent accomplishments
 */
exports.generateMomentumSummary = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    // Get the last 7 days of momentum logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('momentumLogs')
      .where('createdAt', '>=', sevenDaysAgo)
      .orderBy('createdAt', 'desc')
      .get();

    const logs = [];
    logsSnapshot.forEach(doc => {
      logs.push(doc.data());
    });

    if (logs.length === 0) {
      return {
        summary: "You're just getting started! Every journey begins with a single step. Ready to build some momentum? 🚀"
      };
    }

    // Analyze tags and goal connections
    const tagCounts = {};
    const goalCounts = {};
    const taggedLogs = logs.filter(log => log.tags && log.tags.length > 0);
    const goalLinkedLogs = logs.filter(log => log.linkedGoal);

    logs.forEach(log => {
      if (log.tags) {
        log.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
      if (log.linkedGoal) {
        goalCounts[log.linkedGoal] = (goalCounts[log.linkedGoal] || 0) + 1;
      }
    });

    // Create enhanced prompt for AI Coach
    const prompt = `You are an AI Coach analyzing a user's weekly momentum. Create a personalized, encouraging reflection based on their data.

    User's accomplishments: ${logs.map(log => log.text).join(', ')}
    
    Tag analysis: ${Object.entries(tagCounts).map(([tag, count]) => `${tag}: ${count} entries`).join(', ')}
    Goal connections: ${Object.entries(goalCounts).map(([goal, count]) => `${goal}: ${count} steps`).join(', ')}
    
    Write a short, encouraging reflection (2-3 sentences) that:
    1. Acknowledges their progress
    2. Provides gentle insights about their patterns
    3. Offers supportive encouragement
    4. Uses a warm, friendly tone like a caring mentor
    
    Keep it under 150 words and make it feel personal and actionable.`;

    // Try to call Gemini API, with fallback
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const summary = result.response.text();

      return {
        summary: summary,
        tagAnalysis: tagCounts,
        goalProgress: goalCounts,
        totalEntries: logs.length,
        taggedEntries: taggedLogs.length,
        goalLinkedEntries: goalLinkedLogs.length
      };
    } catch (aiError) {
      console.log('AI model not available, using fallback summary');
      
      // Enhanced fallback summary based on data analysis
      const accomplishmentCount = logs.length;
      const topTag = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])[0];
      const topGoal = Object.keys(goalCounts).sort((a, b) => goalCounts[b] - goalCounts[a])[0];
      
      let fallbackSummary = "";
      
      if (accomplishmentCount === 1) {
        fallbackSummary = "You're building momentum! That first step is always the hardest. Keep going! 🚀";
      } else if (accomplishmentCount <= 3) {
        fallbackSummary = "You're on fire! Multiple wins in a short time - that's how you build real momentum! 🔥";
      } else if (accomplishmentCount <= 5) {
        fallbackSummary = "Incredible progress! You're not just moving forward, you're accelerating. This momentum is unstoppable! ⚡";
      } else {
        fallbackSummary = "You're absolutely crushing it! This level of consistency is what separates dreamers from achievers. Keep this energy! 💪";
      }

      // Add tag and goal insights if available
      if (topTag) {
        fallbackSummary += ` I noticed you've been focusing a lot on ${topTag} - that's great energy!`;
      }
      if (topGoal) {
        fallbackSummary += ` You're making solid progress toward your goals. Keep it up!`;
      }
      
      return {
        summary: fallbackSummary,
        tagAnalysis: tagCounts,
        goalProgress: goalCounts,
        totalEntries: logs.length,
        taggedEntries: taggedLogs.length,
        goalLinkedEntries: goalLinkedLogs.length
      };
    }

  } catch (error) {
    console.error('Error generating momentum summary:', error);
    
    // Handle rate limiting
    if (error.status === 429) {
      return {
        summary: "I'm a bit busy right now! 🚀 Your accomplishments are amazing though. Keep up the great work and try again in a few minutes!"
      };
    }
    
    // Handle other API errors
    if (error.status >= 400) {
      return {
        summary: "Something went wrong with the AI magic ✨ But don't worry - your progress is still being tracked! Keep building momentum!"
      };
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to generate summary');
  }
});

/**
 * Generate Weekly AI Coach Reflection
 * Creates a comprehensive weekly reflection based on user's data
 */
exports.generateWeeklyReflection = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    // Get user's compass goals
    const userDoc = await db.collection('users').doc(userId).get();
    const compassGoals = userDoc.data()?.compassGoals || {};

    // Get the last 7 days of momentum logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('momentumLogs')
      .where('createdAt', '>=', sevenDaysAgo)
      .orderBy('createdAt', 'desc')
      .get();

    const logs = [];
    logsSnapshot.forEach(doc => {
      logs.push(doc.data());
    });

    if (logs.length === 0) {
      return {
        reflection: "This week was quiet, and that's perfectly okay! Sometimes the most important step is simply showing up. Ready to start fresh next week? 🌱",
        insights: ["Every journey starts with a single step", "Consistency builds momentum over time"],
        recommendations: ["Start with one small win tomorrow", "Remember, progress isn't always linear"],
        stats: {
          totalEntries: 0,
          activeDays: 0,
          topTag: null,
          topGoal: null,
          tagCounts: {},
          goalCounts: {}
        }
      };
    }

    // Analyze patterns
    const tagCounts = {};
    const goalCounts = {};
    const dailyActivity = {};

    logs.forEach(log => {
      if (log.tags) {
        log.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
      if (log.linkedGoal) {
        goalCounts[log.linkedGoal] = (goalCounts[log.linkedGoal] || 0) + 1;
      }
      
      const day = new Date(log.createdAt.toDate()).toLocaleDateString();
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    });

    const topTag = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])[0];
    const topGoal = Object.keys(goalCounts).sort((a, b) => goalCounts[b] - goalCounts[a])[0];
    const activeDays = Object.keys(dailyActivity).length;

    // Create comprehensive reflection prompt
    const prompt = `You are an AI Coach creating a weekly reflection for a user. Analyze their data and provide insights.

    User's goals: ${Object.values(compassGoals).join(', ')}
    Total accomplishments: ${logs.length}
    Active days: ${activeDays}/7
    Top focus area: ${topTag || 'No tags used'}
    Most progress toward: ${topGoal || 'No goals linked'}
    
    Create a weekly reflection that includes:
    1. A warm opening acknowledging their week
    2. 2-3 specific insights about their patterns
    3. 2-3 gentle recommendations for next week
    4. Encouraging closing
    
    Write in a natural, conversational tone. Don't format as JSON. Just write the reflection as a warm, encouraging message.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse the response to extract insights and recommendations
      const lines = response.split('\n').filter(line => line.trim());
      
      // Find the main reflection (usually the first paragraph)
      const reflection = lines[0] || response;
      
      // Extract insights and recommendations from the response
      const insights = [];
      const recommendations = [];
      
      lines.forEach(line => {
        if (line.toLowerCase().includes('insight') || line.toLowerCase().includes('noticed') || line.toLowerCase().includes('pattern')) {
          insights.push(line.replace(/^[-*•]\s*/, '').trim());
        } else if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest') || line.toLowerCase().includes('try') || line.toLowerCase().includes('next week')) {
          recommendations.push(line.replace(/^[-*•]\s*/, '').trim());
        }
      });
      
      // Ensure we have some insights and recommendations
      if (insights.length === 0) {
        insights.push(
          `You were active ${activeDays} out of 7 days this week`,
          topTag ? `Your main focus was on ${topTag}` : "You're building momentum across different areas",
          topGoal ? `You made progress toward your goals` : "Consider linking actions to your compass goals"
        );
      }
      
      if (recommendations.length === 0) {
        recommendations.push(
          "Keep up the daily momentum",
          "Try adding tags to track your focus areas",
          "Link more actions to your compass goals"
        );
      }
      
      return {
        reflection: reflection,
        insights: insights.slice(0, 3), // Limit to 3 insights
        recommendations: recommendations.slice(0, 3), // Limit to 3 recommendations
        stats: {
          totalEntries: logs.length,
          activeDays,
          topTag,
          topGoal,
          tagCounts,
          goalCounts
        }
      };
      
    } catch (aiError) {
      console.log('AI model not available, using fallback reflection');
      
      // Fallback reflection
      const reflection = `You had ${logs.length} accomplishments this week across ${activeDays} days! That's real momentum. ${topTag ? `You focused heavily on ${topTag} - great energy!` : ''} ${topGoal ? `You're making solid progress toward your goals.` : ''} Keep this energy flowing! ✨`;
      
      return {
        reflection,
        insights: [
          `You were active ${activeDays} out of 7 days this week`,
          topTag ? `Your main focus was on ${topTag}` : "You're building momentum across different areas",
          topGoal ? `You made progress toward your goals` : "Consider linking actions to your compass goals"
        ],
        recommendations: [
          "Keep up the daily momentum",
          "Try adding tags to track your focus areas",
          "Link more actions to your compass goals"
        ],
        stats: {
          totalEntries: logs.length,
          activeDays,
          topTag,
          topGoal,
          tagCounts,
          goalCounts
        }
      };
    }

  } catch (error) {
    console.error('Error generating weekly reflection:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate weekly reflection');
  }
});

/**
 * Create User Profile Cloud Function
 * Creates a new user document when a user signs up
 */
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      compassGoals: {
        goal1: "Set your first goal",
        goal2: "Set your second goal", 
        goal3: "Set your third goal"
      }
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}); 