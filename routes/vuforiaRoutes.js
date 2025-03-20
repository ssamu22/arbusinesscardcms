const express = require("express");
const router = express.Router();
const controller = require("../controllers/vuforiaController");
const multer = require("multer");

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

router
  .route("/")
  .get(controller.getAllCards)
  .post(uploadMarker.single("image"), controller.addCard);

router
  .route("/:id")
  .get(controller.getCard)
  .patch(controller.updateCard)
  .delete(controller.deleteCard);

module.exports = router;
