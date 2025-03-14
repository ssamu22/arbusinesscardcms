// controllers/adminController.js
const userService = require("../models/userService");
const ensureAuthenticated = require("../middlewares/authMiddleware");
const Admin = require("../models/Admin");
const Image = require("../models/Image");
const bcrypt = require("bcrypt"); // For password hashing
const validator = require("validator"); // For email validation
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const supabase = require("../utils/supabaseClient");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.GOOGLE_APP_EMAIL,
    pass: process.env.GOOGLE_APP_PASS,
  },
});

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

exports.forgotPassword = async (req, res) => {
  // 1. Get the admin based on email
  const { data, error } = await supabase
    .from("admin")
    .select("*")
    .eq("email", req.body.email);

  if (data.length === 0) {
    return res.status(404).json({
      status: "failed",
      message: "There is no existing admin associated with this email address!",
    });
  }

  // 2. Generate the random reset token
  const resetData = createPasswordResetToken();

  await supabase
    .from("admin")
    .update({
      password_reset_token: resetData.passwordResetToken,
      token_expiration_date: resetData.tokenExpirationDate,
    })
    .eq("admin_id", data[0].admin_id);

  // 3. Send the reset link to the email of the admin
  try {
    const reqUrl = `${req.protocol}://${req.get(
      "host"
    )}/admin/reset-password/${resetData.resetToken}`;

    const info = await transporter.sendMail({
      from: `"TEAM MID" <${process.env.GOOGLE_APP_EMAIL}>`, // sender address
      to: req.body.email, //  receivers
      subject: "Admin Password Reset Link",
      text: `Password Reset Link`,
      html: `<body>
    <p>We received a request to reset your password.</p>
    <p>If you made this request, please click the link below to reset your password:</p>
    <p><a href="${reqUrl}" style="color: #007bff; text-decoration: none;">${reqUrl}</a></p>
    <p>This link will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>`,
    });
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({
    status: "success",
    data,
  });
};

exports.resetPassword = async (req, res) => {
  // Check if a required value are missing.
  console.log("RESETTING ADMIN PASSWORD!");
  const { password, passwordConfirm } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/;

  // Validate password
  if (!password || !passwordConfirm) {
    return res.status(400).json({
      status: "failed",
      message: "Fill out all required inputs!",
    });
  }

  if (password.length < 8 || password.length > 64) {
    return res.status(400).json({
      status: "failed",
      message: "Password must be between 8 to 64 characters long!",
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      status: "failed",
      message:
        "Password must contain atleast 1 uppercase, 1 lowercase, 1 digit, and 1 special character!",
    });
  }

  if (!(password === passwordConfirm)) {
    return res.status(400).json({
      status: "failed",
      message: "Passwords must match!",
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password in database
  const { data, error } = await supabase
    .from("admin")
    .update({ password: hashedPassword })
    .eq("admin_id", req.params.id);

  // Return response
  res.status(200).json({
    status: "success",
    message: "Passsword successfully reset!",
    data,
  });
};

const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(64).toString("hex");

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const tokenExpirationDate = new Date(
    Date.now() + 10 * 60 * 1000
  ).toISOString();

  return {
    resetToken,
    passwordResetToken,
    tokenExpirationDate,
  };
};
