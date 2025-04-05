const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const ensureAuthenticated = require("../middlewares/authMiddleware");
const viewController = require("../controllers/viewController");
const ensureAdmin = require("../middlewares/authMiddleware");
const path = require("path");

router.use(authController.preventCache);

// Route for user login page
router.get("/", authController.isAuthenticated, viewController.getLoginPage);

router.get(
  "/admin",
  authController.isAuthenticated,
  viewController.getAdminLoginPage
);

router.get("/register", viewController.getRegisterPage);
router.get("/success", viewController.getSuccessPage);
router.get("/forgot-password", viewController.getForgotPasswordPage);
router.get("/reset-password/:token", viewController.getResetPasswordPage);
router.get(
  "/admin/forgot-admin-password",
  viewController.getForgotAdminPasswordPage
);
router.get(
  "/admin/reset-password/:token",
  viewController.getResetAdminPasswordPage
);

// Serve partial pages dynamically
router.get("/home/:page", ensureAuthenticated, (req, res, next) => {
  const page = req.params.page;
  const isAdmin = req.session.admin || null;

  const allowedPages = [
    "overview",
    "achievements",
    "organizations",
    "contacts",
    "schedule",
    "about-lpu-c",
    "change-password",
  ];
  if (allowedPages.includes(page)) {
    return res.render(`pages/user/components/${page}`, {
      user: req.session.user,
      isAdmin,
    });
  }

  next();
});

// Protecting home route
router.get("/home", ensureAuthenticated, (req, res) => {
  const user = req.session.user; // Access logged-in user's information
  const isAdmin = req.session.admin || null;

  res.render(path.join(__dirname, "..", "public", "index.ejs"), {
    user,
    isAdmin,
  });
});

// Protecting admin home route
router.get("/admin/home", ensureAuthenticated.ensureAdmin, (req, res) => {
  console.log("THE CURRENT SESSION: ", req.session);
  const admin = req.session.admin; // Access logged-in user's information
  if (req.session.user) {
    delete req.session.user;
  }
  const adminPath = "resources/views/pages/admin";
  res.render(path.join(__dirname, "..", adminPath, "home.ejs"), { admin });
});

module.exports = router;
