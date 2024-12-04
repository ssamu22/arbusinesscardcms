const Award = require("./../models/Award");
const Image = require("./../models/Image");

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
  res.status(200).json({
    status: "success",
    message: "successfully retrieved lpu awards!",
    data: awards,
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
    console.error("Error in uploadImage:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
