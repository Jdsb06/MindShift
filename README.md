# Project MindShift: Dev README

**Motto:** Trade mindless scrolling for meaningful progress.

This document is a technical blueprint for developers working on the MindShift app. It outlines the required functionality for each feature and the specific "vibe" the frontend needs to embody.

-----

## \#\# Tech Stack 🛠️

* **Frontend:** React (Vite), Tailwind CSS, React Router
* **Backend & Database:** Firebase (Auth, Firestore, Cloud Functions)
* **AI:** OpenAI API

-----

## \#\# Core Pillars & Required Functionality

This is the feature breakdown. Each function must be implemented to fulfill the core user promises.

### \#\#\# Pillar 1: The Compass 🧭

**Purpose:** Connect the user's daily actions to their long-term "why."

* **`[ ]` Data Model:** The `users` document in Firestore must have a `compassGoals` map field (`goal1`, `goal2`, `goal3`).
* **`[ ]` Display Goals:** On the main dashboard, fetch and display the user's three compass goals. They should be prominently visible.
* **`[ ]` Update Goals:** Implement a modal or form where a user can edit and save their three goals. This should call a Firestore `updateDoc` function.

### \#\#\# Pillar 2: The Attention Swap 🧘

**Purpose:** Provide an immediate, healthy alternative to mindless scrolling. This is an *in-app* feature.

* **`[ ]` Trigger Component:** Create a button or a persistent element on the dashboard with a prompt like "Feeling Distracted?" or "Reset Focus."
* **`[ ]` Modal Overlay:** On click, this trigger must launch a full-screen modal overlay.
* **`[ ]` Mindful Action:** The modal will display a simple, non-interactive "mindful action." Start with a guided breathing exercise text (e.g., "Breathe in for 4s, hold for 4s, out for 6s") accompanied by a simple visual timer or animation. The goal is a 1-2 minute pattern interrupt.

### \#\#\# Pillar 3: The Momentum Log ✅

**Purpose:** Build confidence and reduce anxiety by focusing on a "Done" list instead of a "To-Do" list. This is the core interactive feature.

* **`[ ]` Data Model:** Create a sub-collection `momentumLogs` under each `users/{userId}` document. Each log document should contain `text` (string) and `createdAt` (timestamp).
* **`[ ]` Create Log:** The main dashboard must have a simple input field and an "Add" button to create a new momentum log. This function calls `addDoc` to the user's `momentumLogs` sub-collection.
* **`[ ]` Read Logs:** Display the user's momentum logs in a list on the dashboard, sorted with the most recent first. This must use a real-time listener (`onSnapshot`) so the list updates instantly when a new log is added.
* **`[ ]` Delete Log:** Each log entry in the list must have a delete button. This function calls `deleteDoc` on the specific log document.

### \#\#\# AI "Magic" ✨

**Purpose:** Provide delightful, personalized insights without being prescriptive.

* **`[ ]` Firebase Cloud Function:** Create an HTTPS Callable Cloud Function named `generateMomentumSummary`.
* **`[ ]` Function Logic:**
    * The function must be authenticated, receiving the user's `uid`.
    * It fetches the user's last 7 days of `momentumLogs` from Firestore.
    * It formats these logs into a prompt for the OpenAI API. The prompt should ask for a short, witty, and encouraging summary of the user's accomplishments (e.g., "Based on these accomplishments, write a short, encouraging summary for the user in one paragraph. Accomplishments: [...]").
    * It calls the OpenAI API and returns the generated text.
* **`[ ]` Frontend Integration:** Create a button on the dashboard like "✨ Generate My Vibe." On click, it calls the cloud function, shows a loading state, and then displays the returned summary in a visually appealing modal.

-----

## \#\# Frontend Vibe Check: The Gen Z Style Guide

The app's success depends on getting the "vibe" right. It must feel authentic, not corporate.

### \#\#\# UI/UX Principles ("Minimalist Maximalism")

* **Core Layout = Minimalist:** The main architecture must be clean, fast, and intuitive. No clutter. Ample whitespace. The user flow from adding a log to seeing it appear must be effortless.
* **Personality Layer = Maximalist:** Self-expression is key. Allow for deep customization in user-controlled areas.
    * **`[ ]` Dark Mode First:** The default theme is a sleek dark mode. A light mode can be an option later.
    * **`[ ]` Bold & Clean Typography:** Use a modern, readable font. Use font weight and size to create hierarchy, not a million different colors.
    * **`[ ]` Customizable Themes:** The "maximalist" part. Allow users to select from a curated list of 3-5 vibrant accent color themes (e.g., indigo, magenta, teal) that change buttons, highlights, and other UI elements.
    * **`[ ]` Smooth Animations:** All interactions should have subtle, smooth transitions. Things fade in, not just appear. Modals slide up. This makes the app feel premium and alive.

### \#\#\# Language & Tone of Voice

* **Witty & Encouraging:** The microcopy (button text, empty states, loading messages) is our personality. It should be supportive and occasionally witty, like a cool, encouraging friend.
* **No "Cringe":** Avoid trying too hard to use slang. The humor should be smart and self-aware, not a forced meme. For example, instead of "That's fire 🔥," a loading message could be "Brewing up some good vibes..."
* **Authentic & Direct:** Be straight with the user. Error messages should be clear and helpful.
* **Shame-Free:** The app's language must **never** make the user feel guilty for not being productive. It celebrates what they *did* do, never what they didn't.

-----

## \#\# Setup & Run

1.  Navigate to the `frontend` directory: `cd frontend`
2.  Install dependencies: `npm install`
3.  Create a `firebase.js` file in `src/` with your Firebase project configuration.
4.  Run the development server: `npm run dev`

## \#\# Firestore Data Structure

```javascript
// /users/{userId}
{
  email: "user@example.com",
  createdAt: Timestamp,
  compassGoals: {
    goal1: "My first goal",
    goal2: "My second goal",
    goal3: "My third goal"
  }
}

// /users/{userId}/momentumLogs/{logId}
{
  text: "Finished reading a chapter.",
  createdAt: Timestamp
}
```