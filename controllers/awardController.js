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
  const image = await Image.getImage(req.params.imageId);
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
