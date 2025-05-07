const path = require("path");
const supabase = require("../utils/supabaseClient");
const College = require("../models/College");

// Fetch all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const { data: colleges, error } = await supabase
      .from("college")
      .select("college_id, name")
      .order("name", { ascending: true });

    if (error) throw error;

    res.status(200).json(colleges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
};

// update college
exports.updateCollege = async (req, res) => {
  const { name } = req.body;

  try {
    const college = await College.getById(req.params.id);

    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }

    college.name = name;

    const updatedCollege = await college.save();

    console.log(JSON.stringify(updatedCollege));

    res.status(200).json(updatedCollege);
  } catch (error) {
    console.error("Error updating college:", error);
    if (error.code === "23505") {
      return res.status(500).json({ error: "College already exists" });
    } else {
      res.status(500).json({ error: "Failed to update college" });
    }
    
  }
};

// create college
exports.createCollege = async (req, res) => {
  const { name } = req.body;

  try {
    const college = new College(null, name);
    const createdCollege = await college.save();

    console.log(JSON.stringify(createdCollege));

    res.status(201).json(createdCollege);
  } catch (error) {
    console.error("Error creating college:", error);
    if (error.code === "23505") {
      return res.status(500).json({ error: "College already exists" });
    } else {
      res.status(500).json({ error: "Failed to create college" });
    }
    
  }
};

// delete college
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.getById(req.params.id);

    console.log("THE COLLEGE TO BE DLEETED:", college);

    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }

    await college.delete();

    res.status(200).json(college);
  } catch (error) {
    console.error("Error deleting college:", error);
    res.status(500).json({ error: "Failed to delete college" });
  }
};
