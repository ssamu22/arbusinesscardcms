const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes'); // Import routes
const apiRoutes = require('./routes/api'); // Import routes
const app = express();
const port = 3000;

// Session middleware
app.use(session({
    secret: 'miawmiaw', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for parsing URL-encoded bodies (optional)
app.use(express.urlencoded({ extended: true }));

// Serve static files (for login page, etc.)
// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources', 'views')); // EJS views folder

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Use routes from the authRoutes file
app.use('/', authRoutes);
app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
