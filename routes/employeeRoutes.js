const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminEmployeesController");
const employeeController = require("../controllers/employeeController");
const authController = require("../controllers/authController");
const ensureAuthenticated = require("../middlewares/authMiddleware");

router
  .route("/")
  .get(controller.fetchAllEmployee)
  .post(controller.createEmployee);

router
  .route("/:id")
  .put(controller.editEmployeePosition)
  .delete(controller.deleteEmployee);

router.put("/department/:id", controller.updateEmployeeDepartment);
router.put("/archive/:id", controller.archiveEmployee);
router.put("/unarchive/:id", controller.unarchiveEmployee);

router.get("/active", controller.fetchAllActiveEmployee);
router.get("/inactive", controller.fetchAllInactiveEmployee);
router.get("/archive", controller.fetchAllArchivedEmployee);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:id", authController.resetPassword);

router.get("/uses-temp", employeeController.employeeUsesTemp);

// Route for updating profile data
router.post(
  "/update-profile",
  ensureAuthenticated,
  authController.updateProfile
);

module.exports = router;
