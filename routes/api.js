const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const ensureAuthenticated = require('../middlewares/authMiddleware');
const informationController = require('../controllers/informationController');
const episodeController = require('../controllers/episodeController');
const achievementController = require('../controllers/achievementController');


// -- Overview Page Routes --
// Route to get all departments
router.get('/departments', departmentController.getAllDepartments);

// Route to get the current introduction
router.get('/details', ensureAuthenticated, informationController.getDetails);

// -- Timeline Page Routes --
// Route to get all episodes
router.get('/timeline', episodeController.getEpisodes);

// Route to add episode
router.post('/timeline', episodeController.createEpisode);

// Route to update episode
router.put('/timeline', episodeController.updateEpisode);

// Route to delete episode
router.post('/timeline/delete', episodeController.deleteEpisode);

// -- Achievements Page Routes --
// Route to get all achievements
router.get('/achievements', achievementController.getAchievements);

// Route to create achievement
router.post('/achievements', achievementController.createAchievement);

// Route to get all achievement types
router.get('/achievement-types', achievementController.getAchievementTypes);

module.exports = router;
