const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminEmployeesController");

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

// router.get("/employees/edit/:employee_id", employeeController.editEmployee);
// router.post("/employee/delete", employeeController.deleteEmployee);

// router.get("/employees/edit/:employee_id", employeeController.editEmployee);
// router.post("/employee/delete", employeeController.deleteEmployee);

module.exports = router;
