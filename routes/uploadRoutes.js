express = require("express");
router = express.Router();
uploadController = require("./../controllers/uploadController");
const multer = require("multer");
const { uploadCard } = require("./../controllers/uploadController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/markers");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

const uploadMarker = multer({ storage: storage });

// router.route("/card").post("/");
router
  .route("/businessCard")
  .get(uploadController.getAllCards)
  .post(uploadMarker.single("image"), uploadController.uploadCard)
  .delete(uploadController.deleteCard);

router
  .route("/businessCard/:id")
  .patch(uploadController.updateCard)
  .get(uploadController.getCard);
module.exports = router;
