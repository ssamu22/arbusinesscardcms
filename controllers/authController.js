const userService = require('../models/userService');
const Professor = require('../models/professor');
const bcrypt = require('bcrypt'); // For password hashing

// const { Professor, Contact } = require('../models/');

exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    // Step 1: Find the user by email
    const userContact = await userService.findUserByEmail(email);
    if (!userContact) {
      return res.status(401).json({ error: 'User not found' });
    }
  
    // Step 2: Find the corresponding professor by professor_id
    const professor = await userService.findProfessorById(userContact.professor_id);
    if (!professor) {
      return res.status(401).json({ error: 'User not found' });
    }
  
    // Step 3: Compare passwords
    //const isMatch = await bcrypt.compare(password, professor.password);
    if (password !== professor.password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
  
    // Step 4: Store the user session
    req.session.user = professor;

    // Redirect to home page after successful login
    return res.redirect('/home');

  };

// Handle logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
        }
        res.redirect('/');
    });
};

// Ensure the user is authenticated middleware
exports.ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next(); // User is authenticated, proceed to the next middleware or route
    } else {
        res.redirect('/'); // User not authenticated, redirect to login
    }
};

exports.updateProfile = async (req, res) => {
  const { professional, personal } = req.body; // Get the new introduction from the request body

  const userProfile = await Professor.updateProfile(req, res, { professional, personal });
  if(!userProfile){
    res.status(400).json({ error: 'Failed to update profile' });
  }
  
  res.json({ message: 'Profile updated successfully' });
};