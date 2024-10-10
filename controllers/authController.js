const userService = require('../models/userService');
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt'); // For password hashing
const validator = require('validator'); // For email validation

exports.login = async (req, res) => {
  const { email, password } = req.body; // Get login details from the request body

  try {
      // Step 1: Validate the email format
      if (!validator.isEmail(email)) {
         return res.status(400).json({ message: 'Invalid email format' });
      }

      // Step 2: Retrieve employee by email
      const employee = await Employee.findByEmail(email); // Fetch employee from DB
      if (!employee) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }
      // Step 3: Validate the password using the public method
      const passwordMatch = await employee.validatePassword(password);
      if (!passwordMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Step 3: Store employee data in session (excluding private info)
      req.session.user = {
          employee_id: employee.employee_id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.getEmail(),
          position: employee.position,
          department_id: employee.department_id,
      };

      // Step 4: Redirect to the home page or return a success message
      res.redirect('/home'); // You can customize the redirection route as needed
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
  }
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

  const userProfile = await Employee.updateProfile(req, res, { professional, personal });
  if(!userProfile){
    res.status(400).json({ error: 'Failed to update profile' });
  }
  
  res.json({ message: 'Profile updated successfully' });
};