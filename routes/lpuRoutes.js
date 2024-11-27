express = require("express");
router = express.Router();
lpuController = require("../controllers/lpuController");

router.route("/:id").get(lpuController.getBranch);

router.route("/:id/:principle").post(lpuController.updatePrinciple);

module.exports = router;
