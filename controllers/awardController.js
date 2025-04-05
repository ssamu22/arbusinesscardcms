const Award = require("./../models/Award");
const Image = require("./../models/Image");
const supabase = require("../utils/supabaseClient");

exports.getAwards = async (req, res) => {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  const awards = await Award.getAwards();
  // const image = await Image.getImage(req.body.bucket, req.body.filename);
  if (!awards) {
    return res.status(404).json({
      status: "fail",
      message: "Error getting awards!",
    });
  }
  res.status(200).json({
    status: "success",
    message: "successfully retrieved lpu awards!",
    awards: awards,
  });
};

exports.getAwardImage = async (req, res) => {
  const image = await Image.getImageById(req.params.imageId);
  if (!image) {
    return res.status(404).json({
      status: "fail",
      message: "Error geting images",
    });
  }
  res.status(200).json({
    status: "success",
    message: "successfully retrieved lpu awards!",
    data: image,
  });
};

exports.getAwardImages = async (req, res) => {
  console.log(req.body.awardImageIds);
  const images = await Image.getImages(req.body.awardImageIds);
  if (!images) {
    return res.status(404).json({
      status: "fail",
      message: "Error geting images",
    });
  }
  res.status(200).json({
    status: "success",
    message: "successfully retrieved lpu awards!",
    data: images,
  });
};

exports.addAward = async (req, res) => {
  const awardTitle = req.body.title;
  const awardCategory = req.body.category;
  const awardBucket = req.body.bucket;
  const awardImgFile = req.file;

  const uploadedImage = await Image.uploadImage(
    awardImgFile,
    awardBucket,
    awardImgFile.originalname
  );
  const theImage = await Image.getImageById(uploadedImage.image_id);
  console.log("This is the image data: ");
  console.log(theImage);

  const newAward = await Award.addAward(
    awardTitle,
    awardCategory,
    uploadedImage.image_id
  );
  res.status(200).json({
    status: "success",
    message: "successfully added an lpu award!",
    image_data: theImage,
    award_data: newAward,
  });
};

exports.editAward = async (req, res) => {
  updatedAward = await Award.editAward(
    req.params.awardid,
    req.body.awardTitle,
    req.body.awardCategory
  );
  res.status(200).json({
    status: "success",
    message: "successfully edited lpu awards!",
    data: updatedAward,
  });
};

exports.deleteAward = async (req, res) => {
  const { data, error } = await supabase
    .from("award")
    .delete()
    .eq("award_id", req.params.id);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Failed to delete award! Please try again.",
    });
  }

  res
    .status(204)
    .json({ status: "success", message: "Award successfully deleted." });
};

exports.uploadAwardImage = async (req, res) => {
  try {
    console.log("Request Body: ", req.body);
    console.log("Uploaded File: ", req.file); // Provided by multer middleware
    const { bucket, fileName } = req.body;

    if (!req.file || !bucket || !fileName) {
      return res.status(400).json({
        error: "Missing required parameters (file, bucket, fileName).",
      });
    }

    console.log(req.file);
    // Use the Image model to handle upload and creation
    const uploadedImage = await Image.uploadImage(
      req.file,
      bucket,
      req.file.originalname
    );
    const theImage = await Image.getImageById(uploadedImage.image_id);
    const newAwardData = await Award.changeAwardImgId(
      req.params.awardid,
      uploadedImage.image_id
    );

    console.log(theImage);
    res.status(200).json({
      status: "success",
      awardId: req.params.awardid,
      data: theImage,
    });
  } catch (error) {
    console.error("Error in upload Image:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
