const path = require('path');

// Handle login form submission
exports.login = (req, res) => {
    const { username, password } = req.body;

    // Dummy authentication logic for demonstration
    if (username === 'user' && password === 'password') {
        // Redirect to the homepage on successful login
        res.redirect('/home');
    } else {
        // Redirect back to the login page or show an error
        res.redirect('/');
    }
};
