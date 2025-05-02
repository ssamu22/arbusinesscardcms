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
    console.log("THE ADMIN:", admin);
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Step 3: Validate the password using the public method
    const passwordMatch = await admin.validatePassword(password);
    console.log("DOES THE PASSWORD MATCH?", passwordMatch);
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

exports.fetchAllAdmin = async (req, res) => {
  //console.log("THE CURRENT SESSION:", req.session);
  console.log("FETCHING ADMINS...");
  try {
    // Step 1: Fetch all admins
    const admins = await Admin.listAll();

    console.log("ALL ADMINS:", admins);

    const currentAdminId = req.session.admin.admin_id;

    // Step 2: Replace each admin's `image_id` with the corresponding `image_url`
    const adminsWithDetails = admins.map(async (admin) => {
      const adminData = { ...admin };

      adminData.image_url = "";

      // If image_id exists, fetch the corresponding image URL
      if (admin.image_id) {
        const image = await Image.getImageById(admin.image_id);
        adminData.image_url = image ? image.image_url : null;
      }

      // Add email using the getEmail method
      adminData.email = admin.getEmail();

      // Add the isCurrentAdmin flag
      adminData.isCurrentAdmin = admin.admin_id === currentAdminId;

      // Remove `image_id` as it's no longer needed
      delete adminData.image_id;

      return adminData;
    });

    const resolvedAdmins = await Promise.all(adminsWithDetails);

    // Step 3: Send the updated admins list
    res.json({ adminsList: resolvedAdmins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
    }
    res.redirect("/admin");
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
    data: { ...admin, email: admin.getEmail() },
    imageUrl: image.image_url,
  });
};

exports.updateMe = async (req, res) => {
  // Find the admin by its email
  console.log("UPDATE REQUEST BODY:", req.body);
  console.log("SESSION EMAIL", req.session.admin.email);
  const { data, error } = await supabase
    .from("admin")
    .update(req.body)
    .eq("email", req.session.admin.email)
    .single();

  console.log("UPDATED ADMIN DATA:", data);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Error updating admin data!",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Admin data successfully updated!",
    data,
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
    const reqUrl = `${req.protocol}://${req.get("host")}/admin/reset-password/${
      resetData.resetToken
    }`;

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

  console.log("THE BODY PASSWORD:", password);

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
    .update({
      password: hashedPassword,
      password_reset_token: null,
      token_expiration_date: null,
    })
    .eq("admin_id", req.params.id);

  console.log(req.params.id);

  console.log(data);
  // Return response
  res.status(200).json({
    status: "success",
    message: "Passsword successfully reset!",
    data,
  });
};

exports.changeAdminPassword = async (req, res) => {
  // Check if the body contains the current password, new password, and confirm password

  const { newPassword, currentPassword, passwordConfirm } = req.body;

  let changePassErrors = [];
  if (!currentPassword || !newPassword || !passwordConfirm) {
    changePassErrors.push("Please fill out all the required inputs!");
  }

  // Get the current admin
  const admin = await Admin.findByEmail(req.session.admin.email);
  const passwordMatch = await admin.validatePassword(req.body.currentPassword);
  // Check if the current password is correct
  if (!passwordMatch) {
    changePassErrors.push("Your current password is incorrect!");
  }

  if (currentPassword === newPassword) {
    changePassErrors.push(
      "Your new password must not be the same as your last password."
    );
  }

  // Validate the password and password confirm
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/;

  // Check the length of the new password
  if (newPassword.length < 8 || newPassword.length > 64) {
    changePassErrors.push("Password must be between 8 to 64 characters long!");
  }

  // Check the format of the new password
  if (!passwordRegex.test(newPassword)) {
    changePassErrors.push(
      "Password must contain atleast 1 uppercase, 1 lowercase, 1 digit, and 1 special character!"
    );
  }

  // Check if password and password confirm are the same
  if (!(newPassword === passwordConfirm)) {
    changePassErrors.push("Passwords must match!");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Send response

  if (changePassErrors.length != 0) {
    return res.status(400).json({
      status: "failed",
      errors: changePassErrors,
    });
  } else {
    // Update the admin password into the new one
    const { data, error } = await supabase
      .from("admin")
      .update({
        password: hashedPassword,
      })
      .eq("email", req.session.admin.email);
    res.status(200).json({
      status: "success",
      message: "Password successfully updated!",
      data,
    });
  }
};

exports.createEmployee = async (req, res) => {
  console.log("CREATE EMP:", req.body);

  // Check if the email already exists in the db
  const existingEmployee = await supabase
    .from("employee")
    .select()
    .eq("email", req.body.email)
    .single();

  if (existingEmployee.data) {
    return res.status(400).json({
      status: "failed",
      message:
        "An existing account is already associated with the email! Please try another one.",
    });
  }

  // Generate an 8-charac random password
  const randomPassword = generateRandomPassword();
  console.log("RANDOM PASSWORD:", randomPassword); // Example output: "B3y$9jL2"

  // Hash the password
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  console.log("HASHED PASSWORD:", hashedPassword); // Example output: "B3y$9jL2"

  // Create user data to store in the db
  const newUserData = {
    first_name: req.body.fname,
    middle_name: req.body.mname,
    last_name: req.body.lname,
    honorifics: req.body.honorifics,
    email: req.body.email,
    isActive: true,
    password: hashedPassword,
    image_id: 68, // Use default profile image_id
    date_created: new Date().toISOString(),
  };

  // Create the user
  const { data, error } = await supabase.from("employee").insert(newUserData);

  // Get the url of the image

  const image = await Image.getImageById(data[0].image_id);
  data[0].image_url = image ? image.image_url : null;

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: `Failed to create new user: ${error}`,
    });
  }

  // Email the password to the user
  const info = await transporter.sendMail({
    from: `"TEAM MID" <${process.env.GOOGLE_APP_EMAIL}>`, // sender address
    to: req.body.email, // recipient address
    subject: "Your Account Has Been Created for ARCMS",
    text: `Your account has been successfully created.`,
    html: `
      <body>
        <h2>Welcome to ARCMS!</h2>
        <p>Dear User,</p>
        <p>We are excited to inform you that an account has been created for you by the admin. You can now log in to your account using the credentials below:</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Password:</strong> ${randomPassword}</p> <!-- Assuming you store a temporary password -->
        <p>To get started, please log in at the following link:</p>
        <p><a href="https://arbusinesscardcms.onrender.com" style="color: #007bff; text-decoration: none;">Login to your account</a></p>
        <p><strong>Important:</strong> Please log in as soon as possible and change your password to something more secure after your first login.</p>
        <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
        <p>Thank you for joining ARCMS!</p>
        <p>Best regards,<br/>The ARCMS Team</p>
      </body>
    `,
  });

  res.status(200).json({
    status: "success",
    message: "User created!",
    data: data[0],
  });
};

exports.createAdmin = async (req, res) => {
  // Check if the email already exists in the db
  const existingAdmin = await supabase
    .from("admin")
    .select()
    .eq("email", req.body.email)
    .single();

  if (existingAdmin.data) {
    return res.status(400).json({
      status: "failed",
      message:
        "An existing admin account is already associated with the email! Please try another one.",
    });
  }

  // Generate an 8-charac random password
  const randomPassword = generateRandomPassword();

  // Hash the password
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  // Create user data to store in the db
  const newAdminData = {
    admin_name: req.body.admin_name,
    email: req.body.email,
    password: hashedPassword,
  };

  // Create the admin
  const { data, error } = await supabase.from("admin").insert(newAdminData);

  // Get the url of the image

  const image = await Image.getImageById(data[0].image_id);
  data[0].image_url = image ? image.image_url : null;

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: `Failed to create new user: ${error}`,
    });
  }

  // Email the password to the user
  // Email the password to the new admin
  const info = await transporter.sendMail({
    from: `"TEAM MID" <${process.env.GOOGLE_APP_EMAIL}>`, // sender address
    to: req.body.email, // recipient address
    subject: "You’ve Been Invited as an Admin on ARCMS",
    text: `Welcome to ARCMS! An admin account has been created for you. Username: ${req.body.email}, Temporary Password: ${randomPassword}. Please log in and change your password.`,
    html: `
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Welcome to ARCMS!</h2>
      <p>Dear Admin,</p>
      <p>We’re excited to inform you that you’ve been invited to join <strong>ARCMS</strong> as an administrator. Your account has been successfully created and you can now access the admin dashboard using the credentials below:</p>
      
      <ul>
        <li><strong>Email:</strong> ${req.body.email}</li>
        <li><strong>Temporary Password:</strong> ${randomPassword}</li>
      </ul>
      
      <p>To get started, please log in here:</p>
      <p>
        <a href="https://arbusinesscardcms.onrender.com/admin" style="background-color: #007bff; color: #fff; padding: 10px 16px; text-decoration: none; border-radius: 4px;">Login to ARCMS</a>
      </p>
      
      <p><strong>Important:</strong> For security reasons, please log in as soon as possible and change your password after your first login.</p>
      
      <p>If you have any questions or need assistance, don’t hesitate to reach out to our support team.</p>
      
      <p>Welcome aboard!<br/>— The ARCMS Team</p>
    </body>
  `,
  });

  res.status(200).json({
    status: "success",
    message: "Admin successfully invited!",
    data: data[0],
  });
};

exports.changeAdminImage = async (req, res) => {
  const { bucket } = req.body;

  console.log("REQ.SESSION:", req.session.admin);

  // Check if the image file, bucket, and file name exists
  if (!req.file || !bucket) {
    return res.status(400).json({
      error: "Missing required parameters (file, bucket).",
    });
  }

  // Upload the image to the database and storage
  const uploadedImage = await Image.uploadImage(
    req.file,
    bucket,
    req.file.originalname
  );

  if (!uploadedImage) {
    return res.status(400).json({
      status: "failed",
      message: "Error uploading the image to the database!",
    });
  }

  // Get the image by its id
  const theImage = await Image.getImageById(uploadedImage.image_id);

  if (!theImage) {
    return res.status(400).json({
      status: "failed",
      message: "Image cannot be found!",
    });
  }

  // Change the image id of the admin

  const { adminData, error } = await supabase
    .from("admin")
    .update({ image_id: uploadedImage.image_id })
    .eq("admin_id", req.session.admin.admin_id);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Error updating admin avatar!",
    });
  }

  // Return the response containg the image url
  res.status(200).json({
    status: "success",
    awardId: req.params.awardid,
    theImage,
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

function generateRandomPassword(length = 8) {
  return [...crypto.getRandomValues(new Uint8Array(length))]
    .map((x) =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?".charAt(
        x % 70
      )
    )
    .join("");
}

exports.deleteAdmin = async (req, res) => {
  try {
    const adminToDelete = await Admin.findById(req.params.id); // delete the admin

    if (!adminToDelete) {
      return res
        .status(404)
        .json({ error: "Admin not found or unauthorized" });
    }

    const deletedAdmin = await adminToDelete.delete(); // delete the admin

    res.status(200).json(deletedAdmin); // Return the delete admin
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ error: "Failed to delete admin" });
  }
};