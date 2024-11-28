const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const ensureAuthenticated = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const informationController = require('../controllers/informationController');
const scheduleController = require('../controllers/scheduleController');
const achievementController = require('../controllers/achievementController');
const contactController = require('../controllers/contactController');
const organizationController = require('../controllers/organizationController');
const { uploadImage } = require('../controllers/organizationController');


// -- Overview Page Routes --
// Route to get all departments
router.get('/departments', departmentController.getAllDepartments);

// Route to get the current introduction
router.get('/details', ensureAuthenticated, informationController.getDetails);

// -- Achievements Page Routes --
// Route to get all achievements
router.get('/achievements', achievementController.getAchievements);

// Route to create achievement
router.post('/achievements', achievementController.createAchievement);

// Route to update achievement
router.put('/achievements', achievementController.updateAchievement);

// Route to get all achievement types
router.get('/achievement-types', achievementController.getAchievementTypes);

// Route to delete achievement
router.post('/achievement/delete', achievementController.deleteAchievement);

// -- Organizations page routes --
// Route to get all organizations
router.get('/organizations', organizationController.getOrganizations);

// Route to get all organizations
router.post('/organizations', organizationController.createOrganization);

// Route for image uploads from the organization
router.post('/organizations/image', upload.single('file'), uploadImage);

// Route to update organization
router.put('/organizations', organizationController.updateOrganization);

// Route to delete organization
router.post('/organization/delete', organizationController.deleteOrganization);

// -- Contacts page routes --
// Route to get all contacts
router.get('/contacts', contactController.getContacts);

// Route to update contacts
router.put('/contacts', contactController.updateContacts);

// -- Schedule page routes --
// Route to get all schedules
router.get('/schedule', scheduleController.getSchedule);

// Route to update schedule
router.post('/schedule/hours', scheduleController.updateSchedule);

// Route to update consultation types
router.post('/schedule/types', scheduleController.updateTypes);

module.exports = router;
