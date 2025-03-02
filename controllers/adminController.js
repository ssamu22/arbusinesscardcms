// controllers/adminController.js
const userService = require("../models/userService");
const ensureAuthenticated = require("../middlewares/authMiddleware");
const Admin = require("../models/Admin");
const Image = require("../models/Image");
const bcrypt = require("bcrypt"); // For password hashing
const validator = require("validator"); // For email validation

exports.login = async (req, res) => {
  const { email, password } = req.body; // Get login details from the request body

  console.log("THE BODY EMAIL:", email);
  console.log("THE BODY PASSWORD:", password);
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

exports.getMe = async (req, res) => {
  // Find the admin by its email
  const admin = await Admin.findByEmail(req.session.admin.email);

  // Check if the admin does not exist
  if (!admin) {
    res.status(404).json({
      status: "failed",
      message: "user not found",
    });
  }

  console.log("THE CURRENT ADMIN:", admin);

  const image = await Image.getImageById(admin.image_id);
  console.log("THE ADMIN IMAGE:", image);

  console.log("THE ADMIN:", admin);
  res.status(200).json({
    status: "success",
    message: "successfully retrieved current admin data",
    data: req.session.admin,
    imageUrl: image.image_url,
  });
};
