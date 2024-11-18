const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const ensureAuthenticated = require("../middlewares/authMiddleware");
const informationController = require("../controllers/informationController");
const episodeController = require("../controllers/episodeController");
const achievementController = require("../controllers/achievementController");
const contactController = require("../controllers/contactController");

// -- Overview Page Routes --
// Route to get all departments
router.get("/departments", departmentController.getAllDepartments);

// Route to get the current introduction
router.get("/details", ensureAuthenticated, informationController.getDetails);

// -- Timeline Page Routes --
// Route to get all episodes
router
  .get("/timeline", episodeController.getEpisodes)
  .post("/timeline", episodeController.createEpisode)
  .put("/timeline", episodeController.updateEpisode);

// Route to delete episode
router.post("/timeline/delete", episodeController.deleteEpisode);

// -- Achievements Page Routes --
// Route to get all achievements
router
  .get("/achievements", achievementController.getAchievements)
  .post("/achievements", achievementController.createAchievement)
  .put("/achievements", achievementController.updateAchievement);

// Route to get all achievement types
router.get("/achievement-types", achievementController.getAchievementTypes);

// Route to delete achievement
router.post("/achievement/delete", achievementController.deleteAchievement);

// -- Organizations page routes --

// -- Contacts page routes --
// Route to get all contacts
router
  .get("/contacts", contactController.getContacts)
  .put("/contacts", contactController.updateContacts);

// Route to update schedule
router.post("/contacts/schedule", contactController.updateSchedule);

module.exports = router;
