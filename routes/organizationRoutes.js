const express = require("express");
const router = express.Router();
const controller = require("../controllers/organizationController");
const { uploadImage } = require("../models/Image");
const upload = require("../middlewares/upload");

router
  .route("/")
  .get(controller.getOrganizations)
  .post(controller.createOrganization)
  .put(controller.updateOrganization);

router.route("/:id").delete(controller.deleteOrganization);

router.post("/image", upload.single("file"), controller.uploadImage);


module.exports = router;
