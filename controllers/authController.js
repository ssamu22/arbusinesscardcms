const userService = require("../models/userService");
const ensureAuthenticated = require("../middlewares/authMiddleware");
const Employee = require("../models/Employee");
const bcrypt = require("bcrypt"); // For password hashing
const validator = require("validator"); // For email validation
const axios = require("axios");
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

  try {
    const employee = await Employee.findByEmail(email); // Fetch employee from DB

    // Check if employee does not exist or password is incorrect
    if (!employee || !(await employee.validatePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if employee is inactive
    if (!employee.isActive) {
      return res.status(401).json({
        message: "Account is currently unavailable. Please try again.",
      });
    }

    // Step 3: Store employee data in session (excluding private info)
    req.session.user = {
      employee_id: employee.employee_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      honorifics: employee.honorifics,
      email: employee.getEmail(),
      position: employee.position,
      department_id: employee.department_id,
    };

    // Step 4: Redirect to the home page or return a success message
    res.redirect("/home"); // You can customize the redirection route as needed
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
    res.redirect("/");
  });
};

exports.signup = async (req, res) => {
  // Check if a required value are missing.
  const { fname, mname, honorifics, lname, email, password, passwordConfirm } =
    req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/;

  if (!fname || !lname || !email || !password || !passwordConfirm) {
    return res.status(400).json({
      status: "failed",
      message: "Fill out all required inputs!",
    });
  }

  // Validate email
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      status: "failed",
      message: "Email must be valid!",
    });
  }

  // Check if email already exists
  const existingEmployee = await Employee.findByEmail(email);
  if (existingEmployee) {
    console.log("USER EXISTS:", existingEmployee);
    return res
      .status(400)
      .json({ status: "failed", message: "Email already exists." });
  }

  console.log("CARRY ON ");
  // Validate password
  /*
  PASSWORD Criteria:
  1. Must be alteast 8 characters long
  2. Must contain atleast 1 upper, 1 lower, and 1 special character
  4. Maximum of 64 characters
  3. Passwords must match (password and passwordConfirm)
  */

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

  // Create a user but set the status to inactive
  const employeeData = {
    first_name: fname,
    honorifics: honorifics,
    middle_name: mname,
    last_name: lname,
    email: email,
    password: hashedPassword, // Store the hashed password
    image_id: 68, // Use default profile image_id
    date_created: new Date().toISOString(), // Automatically set the creation date
  };

  // Use the Employee class to create a new employee
  const newEmployee = await Employee.create(employeeData);

  // Inactive users must be displayed in the admin page for the admin to accept or reject the user.

  console.log(req.body);
  // Return response
  return res.status(200).json({
    status: "success",
    message: "User successfully register",
    data: req.body,
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      honorifics,
      introduction,
      position,
      researchFields,
      department,
      image_id,
    } = req.body;

    // Sanitize researchFields
    let formattedResearchFields = [];
    if (
      researchFields &&
      (Array.isArray(researchFields) || typeof researchFields === "string")
    ) {
      if (Array.isArray(researchFields)) {
        // Extract values if it's an array of objects
        formattedResearchFields = researchFields.map((field) => field.value);
      } else {
        // Parse and extract values if it's a JSON string
        formattedResearchFields = JSON.parse(researchFields).map(
          (field) => field.value
        );
      }
    }
    // Create the updated profile data
    const updatedProfileData = {
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      honorifics: honorifics,
      introduction: introduction,
      position: position,
      field: formattedResearchFields,
      department_id: department,
    };
    if (image_id) {
      updatedProfileData.image_id = image_id;
    }

    console.log(updatedProfileData);

    // Update the user profile in the database here
    // Assuming you have a function in your model to handle this
    await Employee.update(req.session.user.employee_id, updatedProfileData);

    // Update session with the new profile data, while preserving existing values
    if (req.session.admin) {
      const adminSession = req.session.admin; // Store admin session data temporarily
      req.session.admin = adminSession; // Restore the admin session
      console.log(adminSession);
    }
    req.session.user = {
      ...req.session.user, // Spread existing session values (preserve email, employee_id, etc.)
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      honorifics: honorifics,
      position: position,
      department_id: department,
    };

    // Send a success response
    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

exports.approveUser = async (req, res) => {
  // Change the status of the user from inactive to active
  const user = await Employee.update(req.params.employeeId, { isActive: true });

  console.log("USER APPROVED:", user.getEmail());
  // Send an email to the user
  const nodemailer = require("nodemailer");

  try {
    const info = await transporter.sendMail({
      from: `"TEAM MID" <${process.env.GOOGLE_APP_EMAIL}>`, // sender address
      to: user.getEmail(), //  receivers
      subject: "✔ Registration Approved ✔",
      text: `Registration Approved`,
      html: `<p>Your registration has been approved by the administrators. Please <a href= 'http://localhost:3000/login'>login</a> with your account to proceed.</p>`,
    });
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({
    status: "success",
    message: "User successfully approved!",
    data: user,
  });
};
exports.approveAll = async (req, res) => {
  // Change the status of the user from inactive to active
  const employees = await Employee.activateEmployees();

  console.log(employees);
  // Send an email to the user

  // const nodemailer = require("nodemailer");

  // try {
  //   const info = await transporter.sendMail({
  //     from: `"TEAM MID" <${process.env.GOOGLE_APP_EMAIL}>`, // sender address
  //     to: "blueming972@gmail.com", //  receivers
  //     subject: "✔ Registration Approved ✔",
  //     text: "Registration Approved",
  //     html: "<p>Your registration has been approved by the administrators. Please <a href= 'http://localhost:3000/login'>login</a> with your account to proceed.</p>",
  //   });
  // } catch (err) {
  //   console.log(err);
  // }

  res.status(200).json({
    status: "success",
    message: "User successfully approved!",
    data: employees,
  });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const employee_id = req.session.user.employee_id;
  try {
    const employee = await Employee.findById(employee_id);

    if (!employee) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const checkPassword = await employee.validatePassword(oldPassword);
    if (!checkPassword) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Employee.changePassword(employee_id, hashedPassword);

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

exports.forgotPassword = async (req, res) => {
  // 1. Get the user based on email
  const { data, error } = await supabase
    .from("employee")
    .select("*")
    .eq("email", req.body.email);

  if (data.length === 0) {
    return res.status(404).json({
      status: "failed",
      message: "There is no existing user associated with this email address!",
    });
  }

  // 2. Generate the random reset token
  const resetData = createPasswordResetToken();

  await supabase
    .from("employee")
    .update({
      password_reset_token: resetData.passwordResetToken,
      token_expiration_date: resetData.tokenExpirationDate,
    })
    .eq("employee_id", data[0].employee_id);

  // 3. Send the reset link to the email of the user
  try {
    const reqUrl = `${req.protocol}://${req.get("host")}/reset-password/${
      resetData.resetToken
    }`;

    const info = await transporter.sendMail({
      from: `"TEAM MID" <${process.env.GOOGLE_APP_EMAIL}>`, // sender address
      to: req.body.email, //  receivers
      subject: "Password Reset Link",
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
    .from("employee")
    .update({ password: hashedPassword })
    .eq("employee_id", req.params.id);

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
