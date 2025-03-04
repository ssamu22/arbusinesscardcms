const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const ensureAuthenticated = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const informationController = require("../controllers/informationController");
const { uploadProfilePic } = require("../controllers/informationController");

// -- Overview Page Routes --
// Route to get all departments
router.get("/departments", departmentController.getAllDepartments);

// Route to get the current introduction
router.get("/details", ensureAuthenticated, informationController.getDetails);

// Route to upload profile picture
router.post("/information/image", upload.single("file"), uploadProfilePic);

module.exports = router;
