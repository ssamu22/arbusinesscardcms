const path = require("path");
const supabase = require("../utils/supabaseClient");
const Department = require("../models/Department");

// Fetch all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const { data: departments, error } = await supabase
      .from("department")
      .select("department_id, department_name")
      .order("department_name", { ascending: true });

    if (error) throw error;

    res.status(200).json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

// update department
exports.updateDepartment = async (req, res) => {
  const { department_name } = req.body;

  try {
    const department = await Department.getById(req.params.id);

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    department.department_name = department_name;

    const updatedDepartment = await department.save();

    console.log(JSON.stringify(updatedDepartment));

    res.status(200).json(updatedDepartment);
  } catch (error) {
    console.error("Error updating department:", error);
    if (error.code === "23505") {
      return res.status(500).json({ error: "Department already exists" });
    } else {
      res.status(500).json({ error: "Failed to update department" });
    }
    
  }
};

// create department
exports.createDepartment = async (req, res) => {
  const { department_name } = req.body;

  try {
    const department = new Department(null, department_name, null, null);
    const createdDepartment = await department.save();

    console.log(JSON.stringify(createdDepartment));

    res.status(201).json(createdDepartment);
  } catch (error) {
    console.error("Error creating department:", error);
    if (error.code === "23505") {
      return res.status(500).json({ error: "Department already exists" });
    } else {
      res.status(500).json({ error: "Failed to create department" });
    }
    
  }
};

// delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.getById(req.params.id);

    console.log("THE DEPARTMENT TO BE DLEETED:", department);

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    await department.delete();

    res.status(200).json(department);
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Failed to delete department" });
  }
};
