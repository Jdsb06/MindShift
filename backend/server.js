// 1. Import Express
// This line brings the express library into our file.
const express = require('express');

// 2. Create an instance of an Express app
// This creates our main app object that we'll configure.
const app = express();

// 3. Define a port for our server to listen on
// We'll use port 3001. It's common to use ports above 3000 for local development.
const PORT = 3001;

// 4. Define our test route
// app.get() tells the server what to do when it receives a GET request at a specific URL.
// The URL here is '/api'.
// The function (req, res) => {...} is what runs when a user visits this URL.
app.get('/api', (req, res) => {
    // res.json() sends a response back to the user in JSON format.
    res.json({ message: "Welcome to MindShift!" });
});

// 5. Start the server and make it listen for requests
// This tells our app to start "listening" for incoming requests on the port we defined.
// The function () => {...} is a callback that runs once the server is successfully started.
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});