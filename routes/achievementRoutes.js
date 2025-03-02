const express = require("express");

const router = express.Router();
const controller = require("../controllers/achievementController");

router.route("/").post(controller.createAchievementType);

router
  .route("/:id")
  .patch(controller.updateAchievementType)
  .delete(controller.deleteAchievementType);

module.exports = router;
