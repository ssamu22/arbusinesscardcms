const express = require("express");
const router = express.Router();
const controller = require("../controllers/videoController");
const multer = require("multer");

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Create this directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.route("/").get(controller.getAllVideos);

router
  .route("/:id")
  .get(controller.getVideo)
  .patch(upload.single("video"), controller.updateVideo)
  .delete(controller.deleteVideo);

module.exports = router;
