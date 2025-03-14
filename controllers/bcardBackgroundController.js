const Image = require("../models/Image");
const supabase = require("../utils/supabaseClient");

exports.addBackground = async (req, res) => {};

exports.updateBackground = async (req, res) => {
  //Check if the file is present
  if (!req.file) {
    return res.status(400).json({
      error: "Image is not present!",
    });
  }

  // Upload the new file in the storage bucket
  const uploadedImage = await Image.uploadImage(
    req.file,
    "assets/bcardBackground",
    req.file.originalname
  );

  // Get the image data of the newly updated image
  const theImage = await Image.getImageById(uploadedImage.image_id);

  // Update the image_id of the business card background
  const updatedBg = await supabase
    .from("bcard_background")
    .update({
      image_id: uploadedImage.image_id,
    })
    .eq("bg_id", req.params.id);

  console.log("The new shit:", updatedBg);
  res.status(200).json({
    status: "success",
    data: {
      ...updatedBg.data[0],
      image_url: theImage.image_url,
    },
  });
};

exports.deleteBackground = async (req, res) => {};

exports.getBackground = async (req, res) => {
  const background = await supabase
    .from("bcard_background")
    .select("*")
    .eq("bg_id", req.params.id);

  const bgData = background.data[0];

  // if (!bgData) {
  //   return res.status(404).json({
  //     status: "failed",
  //     message: "background does not exist!",
  //   });
  // }

  console.log("THE BG ID:", bgData.image_id);

  const image = await Image.getImageById(bgData.image_id);

  res.status(200).json({
    status: "success",
    message: "Business card background image successfully retrieved!",
    data: {
      ...bgData,
      image_url: image.image_url,
    },
  });
};

// USE THIS AS REFERENCE
