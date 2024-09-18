require('dotenv').config(); // Load environment variables
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const port = process.env.PORT || 3000;

// Import routes
const apiRoutes = require('./routes/api');

// Middleware
app.use(express.json());  // Handle JSON payloads

// Routes
app.use('/api', apiRoutes);  // All API routes will be under /api

// Start the server
app.listen(port, () => {
  console.log(`CMS server is running on http://localhost:${port}`);
});
