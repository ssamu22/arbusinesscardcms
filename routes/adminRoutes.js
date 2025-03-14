const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const ensureAuthenticated = require("../middlewares/authMiddleware");

router.route("/getMe").get(adminController.getMe);
router.post("/forgot-password", adminController.forgotPassword);
router.post("/reset-password/:id", adminController.resetPassword);

module.exports = router;
