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

router.route("/:id/award/:awardid").patch(awardController.editAward);

router.route("/:id/award/image/:imageId").get(awardController.getAwardImage);
router.route("/:id/award/images").post(awardController.getAwardImages);
module.exports = router;
