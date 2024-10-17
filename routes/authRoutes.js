const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const informationController = require('../controllers/informationController');
const ensureAuthenticated = require('../middlewares/authMiddleware');
const path = require('path');

// Route for the public index page
router.get('/', (req, res) => {
  if (req.session.user) {
      // If user is logged in, redirect to home
      res.redirect('/home');
  } else {
      // If user is not logged in, redirect to login
      res.redirect('/login');
  }
});

// Route for login page
router.get('/login', (req, res) => {
  if (req.session.user) {
      res.redirect('/home'); // Redirect to home if already logged in
  } else {
      res.render('auth/login'); // Render login.ejs
  }
});

// Handle login form submission
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Serve partial pages dynamically
router.get('/home/:page', ensureAuthenticated, (req, res) => {
  const page = req.params.page;
  const allowedPages = ['overview', 'timeline', 'achievements', 'organizations', 'contacts', 'about-lpu-c'];
  if (allowedPages.includes(page)) {
      res.render(`pages/user/components/${page}`, { user: req.session.user });
  } else {
      res.status(404).send('Page not found');
  }
});

// Protecting home route
router.get('/home', ensureAuthenticated, (req, res) => {
  const user = req.session.user; // Access logged-in user's information
  res.render(path.join(__dirname, '..', 'public', 'index.ejs'), { user });
});

// Route for updating profile data
router.post('/update-profile', ensureAuthenticated, authController.updateProfile);

module.exports = router;