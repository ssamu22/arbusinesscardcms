const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const ensureAuthenticated = require("../middlewares/authMiddleware");

router.route("/getMe").get(adminController.getMe);

module.exports = router;
