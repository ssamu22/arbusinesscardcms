const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const ensureAuthenticated = require('../middlewares/authMiddleware');
const ensureAdmin = require('../middlewares/authMiddleware');
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
      res.render('auth/user/login'); // Render login.ejs
  }
});

// Handle login form submission
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Serve partial pages dynamically
router.get('/home/:page', ensureAuthenticated, (req, res) => {
  const page = req.params.page;
  const isAdmin = req.session.admin || null;
  const allowedPages = ['overview', 'achievements', 'organizations', 'contacts', 'schedule', 'about-lpu-c'];
  if (allowedPages.includes(page)) {
      res.render(`pages/user/components/${page}`, { user: req.session.user, isAdmin });
  } else {
      res.status(404).send('Page not found');
  }
});

// Protecting home route
router.get('/home', ensureAuthenticated, (req, res) => {
  const user = req.session.user; // Access logged-in user's information
  const isAdmin = req.session.admin || null;
  res.render(path.join(__dirname, '..', 'public', 'index.ejs'), { user, isAdmin });
});

// Route for updating profile data
router.post('/update-profile', ensureAuthenticated, authController.updateProfile);

// Route for admin login page
router.get('/admin/login', (req, res) => {
  if (req.session.admin) {
      res.redirect('/admin/home'); // Redirect to admin home if already logged in
  } else {
      res.render('auth/admin/login'); // Render admin login page
  }
});

// Handle admin login form submission
router.post('/admin/login', adminController.login);
router.get('/admin/logout', adminController.logout);

// Protecting admin home route
router.get('/admin/home', ensureAuthenticated.ensureAdmin, (req, res) => {
  const admin = req.session.admin; // Access logged-in user's information
  if (req.session.user){
    delete req.session.user;
  }
  const adminPath = 'resources/views/pages/admin';
  res.render(path.join(__dirname, '..', adminPath, 'home.ejs'), { admin });
});

module.exports = router;