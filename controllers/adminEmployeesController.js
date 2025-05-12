// controllers/adminController.js
const Employee = require("../models/Employee");
const Image = require("../models/Image");
const bcrypt = require("bcrypt"); // For password hashing
const path = require("path");
const ensureAdmin = require("../middlewares/authMiddleware");
const validator = require("validator"); // For email validation
const supabase = require("../utils/supabaseClient");
var vuforia = require("vuforia-api");
const upload = require("../middlewares/upload");

var client = vuforia.client({
  serverAccessKey: process.env.VUFORIA_SERVER_ACCESS_KEY,
  serverSecretKey: process.env.VUFORIA_SERVER_SECRET_KEY,
  clientAccessKey: process.env.VUFORIA_CLIENT_ACCESS_KEY,
  clientSecretKey: process.env.VUFORIA_CLIENT_SECRET_KEY,
});

// util for base64 encoding and decoding
var util = vuforia.util();

exports.fetchAllEmployee = async (req, res) => {
  console.log("THE CURRENT SESSION:", req.session);
  try {
    // Step 1: Fetch all employees
    const employees = await Employee.listAll();

    // Step 2: Replace each employee's `image_id` with the corresponding `image_url`
    const employeesWithDetails = employees.map(async (employee) => {
      const employeeData = { ...employee };

      employeeData.image_url = "";

      // If image_id exists, fetch the corresponding image URL
      if (employee.image_id) {
        const image = await Image.getImageById(employee.image_id);
        employeeData.image_url = image ? image.image_url : null;
      }

      // Add email using the getEmail method
      employeeData.email = employee.getEmail();

      // Remove `image_id` as it's no longer needed
      delete employeeData.image_id;

      return employeeData;
    });

    const resolvedEmployees = await Promise.all(employeesWithDetails);

    // Step 3: Send the updated employees list
    res.json({ employeesList: resolvedEmployees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.fetchAllActiveEmployee = async (req, res) => {
  try {
    // Step 1: Fetch all employees
    console.log("THIS IS THE CURRENT SESSION:", req.session);
    const employees = await Employee.getActiveEmployees();

    console.log("ALL ACTIVE EMPLOYEES:", employees);

    // Step 2: Replace each employee's `image_id` with the corresponding `image_url`
    const employeesWithDetails = employees.map(async (employee) => {
      const employeeData = { ...employee };

      employeeData.image_url = "";

      // If image_id exists, fetch the corresponding image URL
      if (employee.image_id) {
        const image = await Image.getImageById(employee.image_id);
        employeeData.image_url = image ? image.image_url : null;
      }

      // Add email using the getEmail method
      employeeData.email = employee.getEmail();

      // Remove `image_id` as it's no longer needed
      delete employeeData.image_id;

      return employeeData;
    });

    const resolvedEmployees = await Promise.all(employeesWithDetails);

    // Step 3: Send the updated employees list
    res.json({ employeesList: resolvedEmployees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.fetchAllArchivedEmployee = async (req, res) => {
  try {
    // Step 1: Fetch all employees
    console.log("THIS IS THE CURRENT SESSION:", req.session);
    const employees = await Employee.getArchivedEmployees();

    console.log("ALL ACTIVE EMPLOYEES:", employees);

    // Step 2: Replace each employee's `image_id` with the corresponding `image_url`
    const employeesWithDetails = employees.map(async (employee) => {
      const employeeData = { ...employee };

      employeeData.image_url = "";

      // If image_id exists, fetch the corresponding image URL
      if (employee.image_id) {
        const image = await Image.getImageById(employee.image_id);
        employeeData.image_url = image ? image.image_url : null;
      }

      // Add email using the getEmail method
      employeeData.email = employee.getEmail();

      // Remove `image_id` as it's no longer needed
      delete employeeData.image_id;

      return employeeData;
    });

    const resolvedEmployees = await Promise.all(employeesWithDetails);

    // Step 3: Send the updated employees list
    res.json({ employeesList: resolvedEmployees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.fetchAllInactiveEmployee = async (req, res) => {
  try {
    // Step 1: Fetch all employees
    const employees = await Employee.getInactiveEmployees();

    console.log("ALL INACTIVE EMPLOYEES:", employees);

    // Step 2: Replace each employee's `image_id` with the corresponding `image_url`
    const employeesWithDetails = employees.map(async (employee) => {
      const employeeData = { ...employee };

      employeeData.image_url = "";

      // If image_id exists, fetch the corresponding image URL
      if (employee.image_id) {
        const image = await Image.getImageById(employee.image_id);
        employeeData.image_url = image ? image.image_url : null;
      }

      // Add email using the getEmail method
      employeeData.email = employee.getEmail();

      // Remove `image_id` as it's no longer needed
      delete employeeData.image_id;

      return employeeData;
    });

    const resolvedEmployees = await Promise.all(employeesWithDetails);

    // Step 3: Send the updated employees list
    res.json({ employeesList: resolvedEmployees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    // Extract data from the request body
    const { fname, mname, lname, honorifics, email } = req.body;

    // Validate required fields
    if (!fname || !lname || !email || !honorifics) {
      return res.status(400).json({
        error: "First name, last name, email, and honorifics are required.",
      });
    }

    // Check if email is existing
    const existingEmployee = await Employee.findByEmail(email);
    if (existingEmployee) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const password = "p@55w0rd"; //default password

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee data
    const employeeData = {
      first_name: fname,
      middle_name: mname || null, // Default to null if middle name is not provided
      last_name: lname,
      honorifics: honorifics,
      email: email,
      password: hashedPassword, // Store the hashed password
      image_id: 68, // Use default profile image_id
      date_created: new Date().toISOString(), // Automatically set the creation date
    };

    // Use the Employee class to create a new employee
    const newEmployee = await Employee.create(employeeData);

    const image = await Image.getImageById(newEmployee.image_id);
    newEmployee.image_url = image ? image.image_url : null;

    // LOG ACTION
    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "CREATE_EMPLOYEE",
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
    // Success response
    res.status(201).json({
      message: "Employee created successfully.",
      employee: {
        employee_id: newEmployee.employee_id,
        first_name: newEmployee.first_name,
        middle_name: newEmployee.middle_name,
        last_name: newEmployee.last_name,
        honorifics: newEmployee.honorifics,
        image_url: newEmployee.image_url,
        email: newEmployee.getEmail(),
        date_created: newEmployee.date_created,
      },
    });
  } catch (err) {
    console.error("Error in createEmployee:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.archiveEmployee = async (req, res) => {
  try {
    const employee_id = req.params.id;

    const existingEmployee = await Employee.findById(employee_id);
    if (!existingEmployee) {
      return res.status(400).json({ error: "Could not found employee." });
    }

    const archivedEmployee = await Employee.archiveEmployee(employee_id);

    // LOG ACTION
    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "ARCHIVE_EMPLOYEE",
        action_details: `${existingEmployee.first_name} ${
          existingEmployee.middle_name
            ? existingEmployee.middle_name.toUpperCase()[0]
            : ""
        }. ${existingEmployee.last_name}: Archived Employee`,
        actor: req.session.admin
          ? req.session.admin.email
          : req.session.user.email,
        is_admin: true,
        status: "success",
        employee_number: req.session.admin
          ? req.session.admin.employee_number
          : req.session.user.employee_number,
      })
      .select()
      .single();

    if (logError) {
      console.log("Error in adding new log:", logError);
      return res.status(400).json({ message: "Error adding log" });
    }

    console.log("New log added:", newLog);

    return res.status(201).json(archivedEmployee);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.unarchiveEmployee = async (req, res) => {
  try {
    const employee_id = req.params.id;

    const existingEmployee = await Employee.findById(employee_id);
    if (!existingEmployee) {
      return res.status(400).json({ error: "Could not found employee." });
    }

    const archivedEmployee = await Employee.unarchiveEmployee(employee_id);

    // LOG ACTION
    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "UNARCHIVE_EMPLOYEE",
        action_details: `${existingEmployee.first_name} ${
          existingEmployee.middle_name
            ? existingEmployee.middle_name.toUpperCase()[0]
            : ""
        }. ${existingEmployee.last_name}: Unarchived Employee`,
        actor: req.session.admin
          ? req.session.admin.email
          : req.session.user.email,
        is_admin: true,
        status: "success",
        employee_number: req.session.admin
          ? req.session.admin.employee_number
          : req.session.user.employee_number,
      })
      .select()
      .single();

    if (logError) {
      console.log("Error in adding new log:", logError);
      return res.status(400).json({ message: "Error adding log" });
    }

    console.log("New log added:", newLog);

    return res.status(201).json(archivedEmployee);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateEmployeeDepartment = async (req, res) => {
  try {
    const { department_id } = req.body;
    const employee_id = req.params.id;

    const existingEmployee = await Employee.findById(employee_id);
    if (!existingEmployee) {
      return res.status(400).json({ error: "Could not found employee." });
    }

    const updatedDepartment = await Employee.updateDepartment(
      employee_id,
      department_id
    );

    // LOG ACTION
    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "UPDATE_EMPLOYEE_DEPARTMENT",
        action_details: `${existingEmployee.first_name} ${
          existingEmployee.middle_name
            ? existingEmployee.middle_name.toUpperCase()[0]
            : ""
        }. ${existingEmployee.last_name}: Department Updated`,
        actor: req.session.admin
          ? req.session.admin.email
          : req.session.user.email,
        is_admin: true,
        status: "success",
        employee_number: req.session.admin
          ? req.session.admin.employee_number
          : req.session.user.employee_number,
      })
      .select()
      .single();

    if (logError) {
      console.log("Error in adding new log:", logError);
      return res.status(400).json({ message: "Error adding log" });
    }

    console.log("New log added:", newLog);

    return res.status(201).json(updatedDepartment);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.editEmployeePosition = async (req, res) => {
  try {
    const { position } = req.body;
    const employee_id = req.params.id;

    const existingEmployee = await Employee.findById(employee_id);
    if (!existingEmployee) {
      return res.status(400).json({ error: "Could not found employee." });
    }

    const updatedPosition = await Employee.updatePosition(
      employee_id,
      position
    );

    // LOG ACTION
    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "UPDATE_EMPLOYEE_POSITION",
        action_details: `${existingEmployee.first_name} ${
          existingEmployee.middle_name
            ? existingEmployee.middle_name.toUpperCase()[0]
            : ""
        } ${existingEmployee.last_name}: ${
          existingEmployee.position
        } -> ${position}`,
        actor: req.session.admin
          ? req.session.admin.email
          : req.session.user.email,
        is_admin: true,
        status: "success",
        employee_number: req.session.admin
          ? req.session.admin.employee_number
          : req.session.user.employee_number,
      })
      .select()
      .single();

    if (logError) {
      console.log("Error in adding new log:", logError);
      return res.status(400).json({ message: "Error adding log" });
    }

    console.log("New log added:", newLog);

    return res.status(201).json(updatedPosition);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("image_target")
      .select()
      .eq("associated_employee", req.params.id)
      .single();

    if (data) {
      client.deleteTarget(data.image_target, async function (error, result) {
        // Check if the business card in vuforia is successfully deleted
        if (error) {
          console.log("Vuforia business card not deleted:", error);
        } else {
          console.log("Vuforia business card deleted!");
        }
      });
    }

    console.log("THE DELETED IMAGE TARGET: ", data);

    const employeeData = await Employee.findById(req.params.id);
    const deletedEmployee = await Employee.delete(req.params.id); // delete the employee
    const deleteQueries = [
      supabase.from("achievement").delete().eq("employee_id", req.params.id),
      supabase.from("contact").delete().eq("employee_id", req.params.id),
      supabase
        .from("employee_schedule")
        .delete()
        .eq("employee_id", req.params.id),
      supabase
        .from("image_target")
        .delete()
        .eq("associated_employee", req.params.id),
      supabase.from("organization").delete().eq("employee_id", req.params.id),
    ];

    const results = await Promise.all(deleteQueries);

    results.forEach(({ error }, index) => {
      if (error) {
        console.error(`Error deleting from table ${index + 1}:`, error);
      }
    });

    // LOG ACTION
    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: employeeData.isApproved ? "DELETE_EMPLOYEE" : "DENY_SIGNUP",
        action_details: `Employee ${
          employeeData.isApproved ? "DELETED" : "REJECTED"
        }: ${employeeData.first_name} ${
          employeeData.middle_name
            ? employeeData.middle_name.toUpperCase()[0]
            : ""
        }. ${employeeData.last_name}`,
        actor: req.session.admin.email,
        is_admin: true,
        status: employeeData.isApproved ? "success" : "rejected",
        employee_number: req.session.admin.employee_number,
      })
      .select()
      .single();

    if (logError) {
      console.log("Error in adding new log:", logError);
      return res.status(400).json({ message: "Error adding log" });
    }

    console.log("New log added:", newLog);

    res.status(200).json(deletedEmployee); // Return the delete employee
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

exports.approveValidationRequest = async (req, res) => {
  // Check if the validation request is for honorifics, research field, and introduction

  if (req.body.action == "UPDATE_RESEARCH_FIELDS") {
  } else if (req.body.action == "UPDATE_USER_INTRO") {
  } else if (req.body.action == "UPDATE_HONORIFICS	") {
  }
  const { data, error } = await supabase.from("employee").update({});
  // Log the action according to which input is validated
  // Return response

  return res.status(200).json({
    status: "success",
    message: "Validation request approved.",
  });
};
