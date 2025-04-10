const supabase = require("../utils/supabaseClient");

exports.addContent = async (req, res) => {
  console.log("ADDING BCARD CONTENT!");
  const { data, error } = await supabase.from("bcard_content").insert(req.body);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Failed to add a new business card content!",
      error,
    });
  }

  res.status(200).json({
    status: "success",

    message: "Successfully added a new business card content!",
    data,
  });
};

exports.getAllContent = async (req, res) => {
  console.log("GETTING ALL BCARD CONTENTS!");
  const { data, error } = await supabase.from("bcard_content").select("*");

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Failed to retrieve all new business card contents!",
      error,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Successfully retrieved all business card contents!",
    data,
  });
};

exports.getContent = async (req, res) => {
  console.log("GETTING A BCARD CONTENT!");
  const { data, error } = await supabase
    .from("bcard_content")
    .select("*")
    .eq("content_id", req.params.id);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Failed to retrieve new business card content",
      error,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Successfully retrieved business card content",
    data,
  });
};

exports.updateContent = async (req, res) => {
  console.log("UPDATING A BCARD CONTENT!");

  console.log("THE REQ BODY:", req.body);
  const { data, error } = await supabase
    .from("bcard_content")
    .update(req.body)
    .eq("content_id", req.params.id);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Failed to update business card content",
      error,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Successfully updated business card content",
    data,
  });
};

exports.deleteContent = async (req, res) => {
  console.log("DELETING BCARD CONTENT!");

  const { error } = await supabase
    .from("bcard_content")
    .delete()
    .eq("content_id", req.params.id);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Failed to delete business card content",
      error,
    });
  }

  res.status(204).json({
    status: "success",
    message: "Successfully deleted business card content",
  });
};

exports.deleteAllContent = async (req, res) => {
  console.log("DELETING BCARD CONTENT!");

  const { error } = await supabase
    .from("bcard_content")
    .delete()
    .not("text", "ilike", "name"); // case-insensitive NOT LIKE

  console.log(error);

  if (error) {
    return res.status(400).json({
      status: "failed",
      message: "Failed to delete business card content",
      error,
    });
  }

  res.status(204).json({
    status: "success",
    message: "Successfully deleted business card content",
  });
};
