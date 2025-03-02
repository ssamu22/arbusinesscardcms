const express = require("express");
const router = express.Router();
const controller = require("../controllers/faqController");
router.route("/").get(controller.getFaqs);


router.route("/updateAll").patch(controller.updateFaq);

// router.get("/faq", faqController.getFaqs);
// router.route("/faq").get(faqController.getFaqs).put(faqController.updateFaq);

module.exports = router;
