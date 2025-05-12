const express = require("express");
const router = express.Router();
const controller = require("../controllers/logController");
router.route("/").get(controller.getAllLogs).post(controller.createLog);
router.route("/allValidation").get(controller.getAllValidationLogs);
router.route("/approve-validation").post(controller.approveValidation);
router.route("/reject-validation").post(controller.rejectValidation);
router
  .route("/:id")
  .get(controller.getLog)
  .patch(controller.updateLog)
  .delete(controller.deleteLog);

module.exports = router;
