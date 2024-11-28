const express = require("express");
const router = express.Router();
lpuController = require("../controllers/lpuController");
awardController = require("../controllers/awardController");

router.route("/:id").get(lpuController.getBranch);

router.route("/:id/:principle").post(lpuController.updatePrinciple);

router
  .route("/:id/awards")
  .get(awardController.getAwards)
  .post(awardController.addAward);

router.route("/:id/award/image/:imageId").get(awardController.getAwardImage);

module.exports = router;
