const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const ensureAuthenticated = require('../middlewares/authMiddleware');
const informationController = require('../controllers/informationController');

// Route to get all departments
router.get('/departments', departmentController.getAllDepartments);

// Route to update the professor's department
router.put('/departments/update', departmentController.updateProfessorDepartment);

// Route to get the current introduction
router.get('/details', ensureAuthenticated, informationController.getDetails);

module.exports = router;
