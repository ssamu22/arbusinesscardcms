const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const ensureAuthenticated = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const informationController = require("../controllers/informationController");
const { uploadProfilePic } = require("../controllers/informationController");
const scheduleController = require("../controllers/scheduleController");
const achievementController = require("../controllers/achievementController");
const contactController = require("../controllers/contactController");
const organizationController = require("../controllers/organizationController");
const { uploadImage } = require("../controllers/organizationController");

// -- Overview Page Routes --
// Route to get all departments
router.get("/departments", departmentController.getAllDepartments);

// Route to get the current introduction
router.get("/details", ensureAuthenticated, informationController.getDetails);

// Route to upload profile picture
router.post("/information/image", upload.single("file"), uploadProfilePic);

// -- Schedule page routes --
// Route to get all schedules
router.get("/schedule", scheduleController.getSchedule);

// Route to update schedule
router.post("/schedule/hours", scheduleController.updateSchedule);

// Route to update consultation types
router.post("/schedule/types", scheduleController.updateTypes);

module.exports = router;
