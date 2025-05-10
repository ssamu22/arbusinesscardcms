const path = require("path");
const supabase = require("../utils/supabaseClient");
const Employee = require("../models/Employee");
const Image = require("../models/Image");

exports.getDetails = async (req, res) => {
  const employee_id = req.session.user.employee_id; // Get the user ID from the session
  try {
    const userInfo = await Employee.getOverviewData(employee_id); // Fetch user info from the database
    const image = userInfo.image_id
      ? await Image.getImageById(userInfo.image_id)
      : null;
    res.json({
      introduction: userInfo.introduction,
      position: userInfo.position,
      fields: userInfo.field,
      image_url: image ? image.image_url : null,
      position: userInfo.position,
      department_id: userInfo.department_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.uploadProfilePic = async (req, res) => {
  try {
    const file = req.file; // Provided by multer middleware
    const { bucket } = req.body;
    const employee_id = req.session.user.employee_id;
    const last_name = req.session.user.last_name;

    console.log("THE REQUEST FILE:", file);
    if (!file || !bucket) {
      return res.status(400).json({
        error: "Missing required parameters (file, bucket).",
      });
    }

    const newImageName =
      employee_id + "_" + last_name + "_" + file.filename + "_" + Date.now();

    // Use the Image model to handle upload and creation

    const uploadedImage = await Image.uploadImage(file, bucket, newImageName);

    console.log("IMAGE UPLOADED!");
    if (!uploadedImage) {
      console.log("FAILED TO UPLOAD IMAGE!");
      return res.status(400).json({
        status: "failed",
        message: "Error uploading the image to the database!",
      });
    }

    // Get the image by its id
    const theImage = await Image.getImageById(uploadedImage.image_id);

    console.log("IMAGE RETRIEVED!");

    if (!theImage) {
      console.log("IMAGE NOT FOUND!");
      return res.status(404).json({
        status: "failed",
        message: "Image cannot be found!",
      });
    }

    // Change the image id of the employee
    const { employeeData, error } = await supabase
      .from("employee")
      .update({ image_id: uploadedImage.image_id })
      .eq("employee_id", employee_id);

    console.log("IMAGE CHANGED!");

    // Return the Image object as the response
    res.status(200).json(uploadedImage);
  } catch (error) {
    console.error("Error in uploadImage:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
