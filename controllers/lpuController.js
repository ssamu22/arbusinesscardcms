const lpu = require("../models/Lpu");

exports.getBranch = async (req, res) => {
  console.log("Request ID:", req.params.id); // Debug log to check the received ID
  const branch = await lpu.getBranch(req.params.id);

  if (!branch) {
    return res.status(404).json({
      status: "error",
      message: `Branch with ID ${req.params.id} not found.`,
    });
  }

  res.status(200).json({
    status: "success",
    message: `Successfully retrieved ${branch.vision}!`,
    branch,
  });
};

exports.updatePrinciple = async (req, res) => {
  console.log("Incoming request body:", req.body); // Log the form data for debugging

  const { id, principle } = req.params;

  console.log("THE NEW TEXT:", req.body.newText);

  const updatedPrinciple = await lpu.updatePrinciple(
    id,
    principle,
    req.body.newText ?? ""
  );

  if (updatedPrinciple.error) {
    return res.status(400).json({
      status: "error",
      message: updatedPrinciple.error,
    });
  }

  res.status(200).json({
    status: "success",
    message: `Successfully updated ${principle}!`,
    data: updatedPrinciple,
  });
};
