const express = require("express");
const router = express.Router();
const controller = require("../controllers/departmentController");

router.route("/").post(controller.createDepartment);

router
  .route("/:id")
  .patch(controller.updateDepartment)
  .delete(controller.deleteDepartment);

module.exports = router;
