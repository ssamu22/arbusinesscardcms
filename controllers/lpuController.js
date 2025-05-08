const lpu = require("../models/Lpu");
const supabase = require("../utils/supabaseClient");

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

  // LOG ACTION
  const { data: newLog, error: logError } = await supabase
    .from("log")
    .insert({
      action: `UPDATE_LPU_${principle.replace(/\s+/g, "_").toUpperCase()}`,
      actor: req.session.admin.email,
      is_admin: true,
      status: "success",
      employee_number: req.session.admin.employee_number,
    })
    .select()
    .single();

  if (logError) {
    console.log("Error in adding new log:", logError);
    return res.status(400).json({ message: "Error adding log" });
  }

  console.log("New log added:", newLog);

  res.status(200).json({
    status: "success",
    message: `Successfully updated ${principle}!`,
    data: updatedPrinciple,
  });
};
