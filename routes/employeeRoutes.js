const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminEmployeesController");
const authController = require("../controllers/authController");
router
  .route("/")
  .get(controller.fetchAllEmployee)
  .post(controller.createEmployee);

router
  .route("/:id")
  .patch(controller.editEmployee)
  .delete(controller.deleteEmployee);

router.get("/active", controller.fetchAllActiveEmployee);
router.get("/inactive", controller.fetchAllInactiveEmployee);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:id", authController.resetPassword);

module.exports = router;
