const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");

// Handle login form submission
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.post("/admin/login", adminController.login);
router.post("/admin/logout", adminController.logout);

router.post("/approve/:employeeId", authController.approveUser);
router.post("/approveAll", authController.approveAll);

router.post("/change-password", authController.changePassword);

module.exports = router;
