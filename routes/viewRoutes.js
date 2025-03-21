const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");

router.get("/", (req, res) => {
  if (req.session.user) {
    // If user is logged in, redirect to home
    res.redirect("/home");
  } else {
    // If user is not logged in, redirect to login
    res.redirect("/login");
  }
});

router.get("/register", viewController.getRegisterPage);
router.get("/success", viewController.getSuccessPage);
router.get("/forgot-password", viewController.getForgotPasswordPage);
router.get("/forgot", viewController.getForgotPasswordPage);
module.exports = router;
