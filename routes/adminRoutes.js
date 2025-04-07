const express = require("express");
const multer = require("multer");
const router = express.Router();

const adminController = require("../controllers/adminController");
const ensureAuthenticated = require("../middlewares/authMiddleware");

// Set up multer storage configuration

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

router.route("/getMe").get(adminController.getMe);
router
  .route("/updateMe")
  .patch(ensureAuthenticated.ensureAdmin, adminController.updateMe);

router.route("/change-avatar").patch(
  // ensureAuthenticated.ensureAdmin,
  upload.single("admin_avatar"),
  adminController.changeAdminImage
);

router
  .route("/thisPassword")
  //ensureAuthenticated.ensureAdmin,
  .patch(adminController.changeAdminPassword);
router.post("/forgot-password", adminController.forgotPassword);
router.post("/reset-password/:id", adminController.resetPassword);

router.post("/create-employee", adminController.createEmployee);

module.exports = router;
