const express = require("express");

const router = express.Router();
const controller = require("../controllers/achievementController");

router
  .route("/")
  .get(controller.getAchievements)
  .post(controller.createAchievement)
  .put(controller.updateAchievement);

router.route("/:id").delete(controller.deleteAchievement);

router
  .route("/type")
  .get(controller.getAchievementTypes)
  .post(controller.createAchievementType);

router
  .route("/type/:id")
  .patch(controller.updateAchievementType)
  .delete(controller.deleteAchievementType);

module.exports = router;
