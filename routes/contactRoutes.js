const express = require("express");
const router = express.Router();
const controller = require("../controllers/contactController");

router.route("/").get(controller.getContacts).patch(controller.updateContacts);

router.route("/allContacts").get(controller.getAllContacts);
module.exports = router;
