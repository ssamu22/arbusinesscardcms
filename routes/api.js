const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
// const dataController = require('../controllers/dataController');

// // File upload route
// router.post('/upload', uploadController.uploadFile);

// // Fetch data from Supabase
// router.get('/data', dataController.fetchData);

// Route to get all departments
router.get('/departments', departmentController.getAllDepartments);

// Route to update the professor's department
router.put('/departments/update', departmentController.updateProfessorDepartment);

module.exports = router;
