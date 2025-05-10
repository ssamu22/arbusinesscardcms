const path = require("path");
const supabase = require("../utils/supabaseClient");
const Achievement = require("../models/Achievement");
const Achievement_type = require("../models/Achievement_type");

exports.getAchievements = async (req, res) => {
  const employee_id = req.session.user.employee_id; // Get the user ID from the session
  try {
    const achievements = await Achievement.getAllAchievement(employee_id); // Fetch user info from the database

    // Check if any timelines were retrieved
    if (!achievements || achievements.length === 0) {
      return res
        .status(404)
        .json({ message: "No achievement found for this employee." });
    }

    const response = await Promise.all(
      achievements.map(async (achievement) => {
        const translatedTypes = await Achievement.translateAchievementtype(
          achievement.achievement_type
        );
        return {
          achievement_id: achievement.achievement_id,
          title: achievement.title,
          description: achievement.description,
          date_achieved: achievement.date_achieved,
          employee_id: achievement.employee_id,
          achievement_type: translatedTypes, // Use the array of translated types here
        };
      })
    );

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAchievementTypes = async (req, res) => {
  try {
    const achievements = await Achievement_type.getAllAchievementType(); // Fetch user info from the database

    // Check if any timelines were retrieved
    if (!achievements || achievements.length === 0) {
      return res.status(404).json({ message: "No achievement type found." });
    }

    const response = await Promise.all(
      achievements.map(async (achievement) => {
        return {
          achievement_id: achievement.achievement_id,
          name: achievement.name,
          icon: achievement.icon,
        };
      })
    );

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createAchievement = async (req, res) => {
  const { title, description, date_achieved, achievement_type } = req.body;
  const employee_id = req.session.user.employee_id; // Assuming the employee ID comes from the session

  try {
    const newAchievement = new Achievement(
      null,
      title,
      description,
      date_achieved,
      employee_id,
      achievement_type
    );
    const createdAchievement = await newAchievement.save(); // Save the new achievement

    const response = await Promise.all(
      createdAchievement.map(async (achievement) => {
        const translatedTypes = await Achievement.translateAchievementtype(
          achievement.achievement_type
        );
        return {
          achievement_id: achievement.achievement_id,
          title: achievement.title,
          description: achievement.description,
          date_achieved: achievement.date_achieved,
          employee_id: achievement.employee_id,
          achievement_type: translatedTypes, // Use the array of translated types here
        };
      })
    );

    console.log(JSON.stringify(response));

    // LOG ACTION
    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "CREATE_ACHIEVEMENT",
        action_details: `New Achievement: ${newAchievement.title}`,
        actor: req.session.user.email,
        is_admin: false,
        status: "success",
        employee_number: req.session.user.employee_number,
      })
      .select()
      .single();

    if (logError) {
      console.log("Error in adding new log:", logError);
      return res.status(400).json({ message: "Error adding log" });
    }

    console.log("New log added:", newLog);

    res.status(201).json(response[0]); // Return the created achievement
  } catch (error) {
    console.error("Error creating achievement:", error);
    res.status(500).json({ error: "Failed to create achievement" });
  }
};

exports.updateAchievement = async (req, res) => {
  const {
    achievement_id,
    title,
    description,
    date_achieved,
    achievement_type,
  } = req.body;
  const employee_id = req.session.user.employee_id;

  try {
    const achievement = await Achievement.getById(achievement_id);

    const oldTitle = achievement.title;
    const oldDesc = achievement.description;
    const oldDateAchieved = achievement.date_achieved;
    const oldAchievementType = achievement.achievement_type;

    if (!achievement || achievement.employee_id !== employee_id) {
      return res
        .status(404)
        .json({ error: "Achievement not found or unauthorized" });
    }

    achievement.title = title;
    achievement.description = description;
    achievement.date_achieved = date_achieved;
    achievement.achievement_type = achievement_type;

    const updatedAchievement = await achievement.save(); // Save the new achievement

    const response = await Promise.all(
      updatedAchievement.map(async (achievement) => {
        const translatedTypes = await Achievement.translateAchievementtype(
          achievement.achievement_type
        );
        return {
          achievement_id: achievement.achievement_id,
          title: achievement.title,
          description: achievement.description,
          date_achieved: achievement.date_achieved,
          employee_id: achievement.employee_id,
          achievement_type: translatedTypes, // Use the array of translated types here
        };
      })
    );

    console.log(JSON.stringify(response));
    console.log("UPDATED TITLE?", achievement.title != title);
    if (oldTitle != title) {
      const { data: newLog, error: logError } = await supabase
        .from("log")
        .insert({
          action: "UPDATE_ACHIEVEMENT_TITLE",
          actor: req.session.user.email,
          action_details: `${achievement.title} -> ${title}`,
          is_admin: false,
          status: "success",
          employee_number: req.session.user.employee_number,
        })
        .select()
        .single();

      if (logError) {
        console.log("Error in adding new log:", logError);
        return res.status(400).json({ message: "Error adding log" });
      }
    }
    if (oldDesc != description) {
      const { data: newLog, error: logError } = await supabase
        .from("log")
        .insert({
          action: "UPDATE_ACHIEVEMENT_DESCRIPTION",
          actor: req.session.user.email,
          action_details: `Achievement: ${title} | Description updated`,
          is_admin: false,
          status: "success",
          employee_number: req.session.user.employee_number,
        })
        .select()
        .single();

      if (logError) {
        console.log("Error in adding new log:", logError);
        return res.status(400).json({ message: "Error adding log" });
      }
    }
    if (oldDateAchieved != date_achieved) {
      const { data: newLog, error: logError } = await supabase
        .from("log")
        .insert({
          action: "UPDATE_ACHIEVEMENT_DATE_ACHIEVED",
          actor: req.session.user.email,
          action_details: `Achievement: ${title} | ${achievement.date_achieved} -> ${date_achieved}`,
          is_admin: false,
          status: "success",
          employee_number: req.session.user.employee_number,
        })
        .select()
        .single();

      if (logError) {
        console.log("Error in adding new log:", logError);
        return res.status(400).json({ message: "Error adding log" });
      }
    }
    if (oldAchievementType != achievement_type) {
      const { data: newLog, error: logError } = await supabase
        .from("log")
        .insert({
          action: "UPDATE_ACHIEVEMENT_TYPE",
          actor: req.session.user.email,
          action_details: `Achievement: ${title} | Achievement type updated`,
          is_admin: false,
          status: "success",
          employee_number: req.session.user.employee_number,
        })
        .select()
        .single();

      if (logError) {
        console.log("Error in adding new log:", logError);
        return res.status(400).json({ message: "Error adding log" });
      }
    }

    res.status(201).json(response[0]); // Return the created achievement
  } catch (error) {
    console.error("Error updating achievement:", error);
    res.status(500).json({ error: "Failed to update achievement" });
  }
};

exports.deleteAchievement = async (req, res) => {
  // const { achievement_id } = req.body;

  console.log("DELETING THE ACHIEVEMENT:", req.params.id);
  try {
    const achievement = await Achievement.getById(req.params.id); // Fetch the existing episode by ID

    if (!achievement) {
      return res
        .status(404)
        .json({ error: "Achievement not found or unauthorized" });
    }

    const deletedAchievement = await achievement.delete(); // delete the episode

    // LOG ACTION

    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "DELETE_ACHIEVEMENT",
        action_details: `Achievement Deleted: ${achievement.title}`,
        actor: req.session.user.email,
        is_admin: false,
        status: "success",
        employee_number: req.session.user.employee_number,
      })
      .select()
      .single();

    if (logError) {
      console.log("Error in adding new log:", logError);
      return res.status(400).json({ message: "Error adding log" });
    }

    console.log("New log added:", newLog);
    res.status(200).json(deletedAchievement); // Return the delete episode
  } catch (error) {
    console.error("Error deleting achievement:", error);
    res.status(500).json({ error: "Failed to delete achievement" });
  }
};

// update achievement type
exports.updateAchievementType = async (req, res) => {
  const { name, icon } = req.body;

  try {
    const achievement = await Achievement_type.getById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ error: "Achievement_type not found" });
    }

    const oldAchievement = achievement.name;
    achievement.name = name;
    achievement.icon = icon;

    const updatedAchievement = await achievement.save();

    console.log(JSON.stringify(updatedAchievement));

    // LOG ACTION

    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "UPDATE_ACHIEVEMENT_TYPE",
        action_details: `Achievement Type Updated: ${name}`,
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

    res.status(200).json(updatedAchievement);
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Failed to update department" });
  }
};

// create achievement type
exports.createAchievementType = async (req, res) => {
  const { name, icon } = req.body;

  try {
    const newAchievement = new Achievement_type(null, name, icon);
    const createdAchievement = await newAchievement.save();

    console.log(JSON.stringify(createdAchievement));

    // LOG ACTION

    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "CREATE_ACHIEVEMENT_TYPE",
        actor: req.session.admin.email,
        action_details: `Achievement Type Added: ${name}`,
        is_admin: false,
        status: "requested",
        employee_number: req.session.admin.employee_number,
      })
      .select()
      .single();

    if (logError) {
      console.log("Error in adding new log:", logError);
      return res.status(400).json({ message: "Error adding log" });
    }

    res.status(201).json(createdAchievement);
  } catch (error) {
    console.error("Error creating achievement type:", error);
    res.status(500).json({ error: "Failed to create achievement type" });
  }
};

// delete achievement type
exports.deleteAchievementType = async (req, res) => {
  try {
    const achievement = await Achievement_type.getById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ error: "Achievement_type not found" });
    }

    const deletedAchievement = await achievement.delete();

    // LOG ACTION

    const { data: newLog, error: logError } = await supabase
      .from("log")
      .insert({
        action: "DELETE_ACHIEVEMENT_TYPE",
        action_details: `Achievement Type: ${achievement.name}`,
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

    res.status(200).json(deletedAchievement);
  } catch (error) {
    console.error("Error deleting achievement type:", error);
    res.status(500).json({ error: "Failed to delete achievement type" });
  }
};
