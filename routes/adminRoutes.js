const express = require("express");
const router = express.Router();
const employeeController = require('../controllers/adminEmployeesController');

router
    .route("/employees")
    .get(employeeController.fetchAllEmployee)
    .post(employeeController.createEmployee);

router.get("/employees/edit/:employee_id", employeeController.editEmployee);
router.post("/employee/delete", employeeController.deleteEmployee);

module.exports = router;
