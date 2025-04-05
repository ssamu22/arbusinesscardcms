const express = require("express");
const router = express.Router();
const controller = require("../controllers/awardController");

router.route("/:id").delete(controller.deleteAward);

module.exports = router;
