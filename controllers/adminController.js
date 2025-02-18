// controllers/adminController.js
const userService = require("../models/userService");
const ensureAuthenticated = require("../middlewares/authMiddleware");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt"); // For password hashing
const validator = require("validator"); // For email validation

exports.login = async (req, res) => {
  const { email, password } = req.body; // Get login details from the request body

  try {
    // Step 1: Validate the email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Step 2: Retrieve admin by email
    const admin = await Admin.findByEmail(email); // Fetch admin from DB
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Step 3: Validate the password using the public method
    const passwordMatch = await admin.validatePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 3: Store admin data in session (excluding private info)
    req.session.admin = {
      admin_id: admin.admin_id,
      admin_name: admin.admin_name,
      email: admin.getEmail(),
    };

    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
    });

    // Step 4: Redirect to the home page or return a success message
    res.redirect("/admin/home"); // You can customize the redirection route as needed
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
    }
    res.redirect("/admin/login");
  });
};
