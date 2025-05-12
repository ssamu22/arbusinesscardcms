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

exports.getAllValidationLogs = async (req, res) => {
  const { data, error } = await supabase
    .from("log")
    .select("*")
    .in("action", [
      "UPDATE_USER_INTRO",
      "UPDATE_RESEARCH_FIELDS",
      "UPDATE_HONORIFICS",
    ]);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Failed to retrieve all logs",
      error: error.message,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Successfully retrieved all user validation logs",
    data,
  });
};

exports.approveValidation = async (req, res) => {
  // FIND USER USING EMPLOYEE NUMBER

  console.log("THE BODY:", req.body);
  const { data: existingData, error: existingError } = await supabase
    .from("employee")
    .select()
    .eq("employee_number", req.body.employee_number)
    .single();

  console.log("THE EXISTING EMPLOYEE:", existingData);

  if (existingError) {
    return res.status(404).json({
      status: "failed",
      message: "Failed to retrieve existing employee",
      existingError,
    });
  }
  // CHANGE IS EDITED TO FALSE AND REMOVE ALL OLD DATA
  const { data, error } = await supabase
    .from("employee")
    .update({
      introIsEdited:
        req.body.action == "UPDATE_USER_INTRO"
          ? false
          : existingData.introIsEdited,
      fieldIsEdited:
        req.body.action == "UPDATE_RESEARCH_FIELDS"
          ? false
          : existingData.fieldIsEdited,
      honorIsEdited:
        req.body.action == "UPDATE_HONORIFICS"
          ? false
          : existingData.honorIsEdited,
      oldIntroduction:
        req.body.action == "UPDATE_USER_INTRO"
          ? ""
          : existingData.oldIntroduction,
      oldHonorifics:
        req.body.action == "UPDATE_HONORIFICS"
          ? ""
          : existingData.oldHonorifics,
      oldField:
        req.body.action == "UPDATE_RESEARCH_FIELDS"
          ? []
          : existingData.oldField,
    })
    .eq("employee_number", req.body.employee_number)
    .eq("email", req.body.actor);

  // DELETE APPROVAL REQUEST LOG
  const { data: deleteLog, error: deleteError } = await supabase
    .from("log")
    .delete()
    .eq("action", req.body.action)
    .eq("employee_number", req.body.employee_number)
    .eq("actor", req.body.actor);

  // LOG APPROVAL ACTION
  const { data: newLog, error: logError } = await supabase
    .from("log")
    .insert({
      action: `APPROVE_${req.body.action}`,
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

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Failed to approve validation",
      error,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Action approved!",
    data,
  });
};
exports.rejectValidation = async (req, res) => {
  // Get the current existing data
  const { data: existingData, error: existingError } = await supabase
    .from("employee")
    .select()
    .eq("employee_number", req.body.employee_number)
    .single();

  if (existingError) {
    return res.status(404).json({
      status: "failed",
      message: "failed to retrieve existing user",
    });
  }

  // Revert the  current data back to the old data
  const { data, error } = await supabase
    .from("employee")
    .update({
      introIsEdited:
        req.body.action == "UPDATE_USER_INTRO"
          ? false
          : existingData.introIsEdited,
      fieldIsEdited:
        req.body.action == "UPDATE_RESEARCH_FIELDS"
          ? false
          : existingData.fieldIsEdited,
      honorIsEdited:
        req.body.action == "UPDATE_HONORIFICS"
          ? false
          : existingData.honorIsEdited,
      introduction:
        req.body.action == "UPDATE_USER_INTRO"
          ? existingData.oldIntroduction
          : existingData.introduction,
      honorifics:
        req.body.action == "UPDATE_HONORIFICS"
          ? existingData.oldHonorifics
          : existingData.honorifics,
      field:
        req.body.action == "UPDATE_RESEARCH_FIELDS"
          ? existingData.oldField
          : existingData.field,
      oldIntroduction:
        req.body.action == "UPDATE_USER_INTRO"
          ? ""
          : existingData.oldIntroduction,
      oldHonorifics:
        req.body.action == "UPDATE_HONORIFICS"
          ? ""
          : existingData.oldHonorifics,
      oldField:
        req.body.action == "UPDATE_RESEARCH_FIELDS"
          ? []
          : existingData.oldField,
    })
    .eq("employee_number", req.body.employee_number)
    .eq("email", req.body.actor);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "failed to update user",
      error,
    });
  }
  // Delete the approval request log
  const { data: deleteLog, error: deleteError } = await supabase
    .from("log")
    .delete()
    .eq("action", req.body.action)
    .eq("employee_number", req.body.employee_number)
    .eq("actor", req.body.actor);

  // Log the reject action
  const { data: newLog, error: logError } = await supabase
    .from("log")
    .insert({
      action: `REJECT_${req.body.action}`,
      actor: req.session.admin.email,
      is_admin: true,
      status: "success",
      employee_number: req.session.admin.employee_number,
    })
    .select()
    .single();

  res.status(200).json({
    status: "success",
    message: "Validation rejected",
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
