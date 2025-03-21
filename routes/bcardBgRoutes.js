const express = require("express");
const router = express.Router();
const controller = require("../controllers/bcardBackgroundController");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

router.use(upload.single("bcard_image"));

router.route("/").post(controller.addBackground);

router
  .route("/:id")
  .get(controller.getBackground)
  .patch(controller.updateBackground)
  .delete(controller.deleteBackground);

module.exports = router;
