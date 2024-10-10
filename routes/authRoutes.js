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

// Protecting home route
router.get('/home', ensureAuthenticated, (req, res) => {
  const user = req.session.user; // Access logged-in user's information
  res.render('pages/user/home', { user }); // Pass user information to the home page
});

// Route for updating profile data
router.put('/update-profile', ensureAuthenticated, authController.updateProfile);

// Route for edit details page
router.get('/edit-details', ensureAuthenticated, informationController.edit);

// Route to get the current introduction
router.get('/api/details', ensureAuthenticated, informationController.getDetails);

// // Route to update the introduction
// router.put('/api/details', ensureAuthenticated, informationController.updateDetails);

module.exports = router;