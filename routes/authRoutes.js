const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const informationController = require('../controllers/informationController');
const ensureAuthenticated = require('../middlewares/authMiddleware');
const path = require('path');

// Route for login page
router.get('/', (req, res) => {
    res.render(path.join(__dirname, '../public/index.ejs'));
});

// Handle login form submission
router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

// Protecting home route
router.get('/home', ensureAuthenticated, (req, res) => {
    const user = req.session.user; // Access logged-in user's information
    res.render('home', { user }); // Pass user information to the home page
  });

module.exports = router;

// Route for edit details page
router.get('/edit-details', ensureAuthenticated, informationController.edit);

// Route to get the current introduction
router.get('/api/details', ensureAuthenticated, informationController.getDetails);

// Route to update the introduction
router.put('/api/details', ensureAuthenticated, informationController.updateDetails);

