const path = require("path");
const supabase = require("../utils/supabaseClient");

exports.getAllLogs = async (req, res) => {
  const { data, error } = await supabase.from("log").select("*");

  if (error) {
    console.log("ERROR RETRIEVING ALL LOGS:", error);
    return res.status(400).json({
      status: "failed",
      message: "Failed to retrieve all logs",
      error: error.message,
    });
  }
  res.status(200).json({
    status: "success",
    message: "All logs successfully retrieved.",
    data,
  });
};

exports.getLog = async (req, res) => {
  const { data, error } = await supabase
    .from("log")
    .select("*")
    .eq("log_id", req.params.id);

  if (error) {
    console.log("ERROR RETRIEVING LOG:", error);
    return res.status(400).json({
      status: "failed",
      message: "Failed to retrieve log",
      error: error.message,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Log successfully retrieved.",
    data,
  });
};

exports.deleteLog = async (req, res) => {
  const { data, error } = await supabase
    .from("log")
    .delete()
    .eq("log_id", req.params.id);

  if (error) {
    console.log("ERROR DELETING LOG:", error);
    return res.status(400).json({
      status: "failed",
      message: "Failed to delete log",
      error: error.message,
    });
  }
  res.status(204).json({
    status: "success",
    message: "Log successfully deleted.",
    data,
  });
};

exports.updateLog = async (req, res) => {
  const { data, error } = await supabase
    .from("log")
    .update(req.body)
    .eq("log_id", req.params.id);

  if (error) {
    console.log("ERROR CREATING LOG:", error);
    return res.status(400).json({
      status: "failed",
      message: "Failed to update log",
      error: error.message,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Log successfully updated.",
    data,
  });
};

exports.createLog = async (req, res) => {
  const { data, error } = await supabase.from("log").insert(req.body);

  if (error) {
    console.log("ERROR CREATING LOG:", error);
    return res.status(400).json({
      status: "failed",
      message: "Failed to create log",
      error: error.message,
    });
  }

  return res.status(200).json({
    status: "success",
    message: "Log successfully created.",
    data,
  });
};
