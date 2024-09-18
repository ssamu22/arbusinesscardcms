const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const dataController = require('../controllers/dataController');

// File upload route
router.post('/upload', uploadController.uploadFile);

// Fetch data from Supabase
router.get('/data', dataController.fetchData);

module.exports = router;
