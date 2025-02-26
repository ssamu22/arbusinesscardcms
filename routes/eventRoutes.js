const express = require("express");
const controller = require("../controllers/eventsController");
const router = express.Router();
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname); // You can modify the filename if needed
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

router.use(upload.single("event_image"));

router.route("/").get(controller.getAllEvents).post(controller.addEvent);

router
  .route("/:eventId")
  .patch(controller.updateEvent)
  .delete(controller.deleteEvent);

module.exports = router;
