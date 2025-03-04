const express = require("express");
const router = express.Router();
const controller = require("../controllers/faqController");
router.route("/").get(controller.getFaqs);

router.route("/updateAll").patch(controller.updateFaq);
module.exports = router;
