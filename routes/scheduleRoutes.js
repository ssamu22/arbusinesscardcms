const express = require("express");
const router = express.Router();
const controller = require("../controllers/scheduleController");

router.route("/").get(controller.getSchedule).patch(controller.updateSchedule);
router.route("/types").patch(controller.updateTypes);
module.exports = router;
