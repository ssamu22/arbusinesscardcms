const express = require("express");
const router = express.Router();
const controller = require("../controllers/logController");
router.route("/").get(controller.getAllLogs).post(controller.createLog);
router
  .route("/:id")
  .get(controller.getLog)
  .patch(controller.updateLog)
  .delete(controller.deleteLog);

module.exports = router;
