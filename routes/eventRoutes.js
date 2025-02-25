const express = require("express");
const controller = require("../controllers/eventsController");
const router = express.Router();

router.route("/").get(controller.getAllEvents);

module.exports = router;
