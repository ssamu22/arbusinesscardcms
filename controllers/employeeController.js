const supabase = require("../utils/supabaseClient");
const Image = require("../models/Image");

exports.employeeUsesTemp = async (req, res) => {
  console.log("USER SESSION:", req.session);

  const { data, error } = await supabase
    .from("employee")
    .select("password_is_temp")
    .eq("employee_id", req.session.user.employee_id);

  console.log("THE DATA:", data);

  if (error) {
    res.status(404).json({
      status: "failed",
      error,
    });
  }
  res.status(200).json({
    status: "success",
    password_is_temp: data[0].password_is_temp,
  });
};

exports.getEmployeeCardImage = async (req, res) => {
  // Get the target data
  const { data: targetData, error: targetError } = await supabase
    .from("image_target")
    .select("*")
    .eq("associated_employee", req.params.id)
    .single();
  if (targetError) {
    return res.status(404).json({
      status: "failed",
      message: "User does not have a business card registered!",
    });
  }

  console.log("THE TARGET IMAGE:", targetData);

  // Get Image

  try {
    const imageData = await Image.getImageById(targetData.image_id);

    res.status(200).json({
      status: "success",
      message: "Business card image retrieved!",
      image_url: imageData.image_url,
    });
  } catch (err) {
    return res.status(404).json({
      status: "failed",
      message: "Failed to retrieve business card image!",
    });
  }
};
