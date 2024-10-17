const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const ensureAuthenticated = require('../middlewares/authMiddleware');
const informationController = require('../controllers/informationController');
const episodeController = require('../controllers/episodeController');

// -- Overview Page Routes --
// Route to get all departments
router.get('/departments', departmentController.getAllDepartments);

// Route to get the current introduction
router.get('/details', ensureAuthenticated, informationController.getDetails);

// -- Timeline Page Routes --
// Route to get all episodes
router.get('/timeline', episodeController.getEpisodes);

module.exports = router;
