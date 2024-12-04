const express = require("express");
const router = express.Router();
lpuController = require("../controllers/lpuController");
awardController = require("../controllers/awardController");

const multer = require("multer");

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Path where the file should be stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname); // You can modify the filename if needed
  },
});

const uploadMarker = multer({ storage: storage });

router
  .route("/:id/award/images/:awardid")
  .post(uploadMarker.single("file"), awardController.uploadAwardImage);

router.route("/:id").get(lpuController.getBranch);

router.route("/:id/:principle").post(lpuController.updatePrinciple);

router
  .route("/:id/awards")
  .get(awardController.getAwards)
  .post(awardController.addAward);

router.route("/:id/award/:awardid").patch(awardController.editAward);

router.route("/:id/award/image/:imageId").get(awardController.getAwardImage);
router.route("/:id/award/images").post(awardController.getAwardImages);
router
  .route("/:id/award/images/:awardid")
  .post(awardController.uploadAwardImage);
module.exports = router;
