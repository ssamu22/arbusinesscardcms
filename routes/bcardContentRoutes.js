const express = require("express");
const router = express.Router();
const controller = require("../controllers/bcardcontentsController");

router.route("/").get(controller.getAllContent).post(controller.addContent);

router.route("/:id").get(controller.getContent).patch(controller.updateContent).delete(controller.deleteContent);

module.exports = router;
