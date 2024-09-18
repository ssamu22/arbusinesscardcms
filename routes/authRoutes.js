const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for login page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle login form submission
router.post('/login', authController.login);

module.exports = router;
