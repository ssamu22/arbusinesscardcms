const express = require("express");
const router = express.Router();

const employeeController = require('../controllers/adminEmployeesController');
const faqController = require('../controllers/faqController');
const departmentController = require('../controllers/departmentController');
const achievementController = require('../controllers/achievementController');

router
  .route("/employees")
  .get(employeeController.fetchAllEmployee)
  .post(employeeController.createEmployee);

router.get("/employees/active", employeeController.fetchAllActiveEmployee);
router.get("/employees/inactive", employeeController.fetchAllInactiveEmployee);

router.get("/employees/edit/:employee_id", employeeController.editEmployee);
router.post("/employee/delete", employeeController.deleteEmployee);

router.get("/faq", faqController.getFaqs);

router
  .route("/department/:department_id")
  .put(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment);


router.post("/department", departmentController.createDepartment);

router.route("/achievement/:achievement_id")
    .put(achievementController.updateAchievementType)
    .delete(achievementController.deleteAchievementType);

router.post("/achievement", achievementController.createAchievementType);

router.route("/faq")
    .get(faqController.getFaqs)
    .put(faqController.updateFaq);

module.exports = router;
