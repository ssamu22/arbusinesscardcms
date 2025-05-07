const express = require("express");
const router = express.Router();
const controller = require("../controllers/collegeController");

router.route("/").post(controller.createCollege);

router
  .route("/:id")
  .patch(controller.updateCollege)
  .delete(controller.deleteCollege);

module.exports = router;
