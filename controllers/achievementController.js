const path = require('path');
const supabase = require('../utils/supabaseClient');
const Achievement = require('../models/Achievement');
const Achievement_type = require('../models/Achievement_type');


exports.getAchievements = async (req, res) => {
    const employee_id = req.session.user.employee_id; // Get the user ID from the session
    try {
        const achievements = await Achievement.getAllAchievement(employee_id); // Fetch user info from the database

        // Check if any timelines were retrieved
        if (!achievements || achievements.length === 0) {
            return res.status(404).json({ message: 'No achievement found for this employee.' });
        }

        const response = await Promise.all(achievements.map(async (achievement) => {
            const translatedTypes = await Achievement.translateAchievementtype(achievement.achievement_type);
            return {
                achievement_id: achievement.achievement_id,
                title: achievement.title,
                description: achievement.description,
                date_achieved: achievement.date_achieved,
                employee_id: achievement.employee_id,
                achievement_type: translatedTypes, // Use the array of translated types here
            };
        }));

        res.json(response); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAchievementTypes = async (req, res) => {
    try {
        const achievements = await Achievement_type.getAllAchievementType(); // Fetch user info from the database

        // Check if any timelines were retrieved
        if (!achievements || achievements.length === 0) {
            return res.status(404).json({ message: 'No achievement type found.' });
        }

        const response = await Promise.all(achievements.map(async (achievement) => {
            return {
                achievement_id: achievement.achievement_id,
                name: achievement.name,
                icon: achievement.icon
            };
        }));

        res.json(response); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createAchievement = async (req, res) => {
    const { title, description, date_achieved, achievement_type } = req.body;
    const employee_id = req.session.user.employee_id; // Assuming the employee ID comes from the session

    try {
        const newAchievement = new Achievement(null, title, description, date_achieved, employee_id, achievement_type);
        const createdAchievement = await newAchievement.save(); // Save the new achievement

        const response = await Promise.all(createdAchievement.map(async (achievement) => {
            const translatedTypes = await Achievement.translateAchievementtype(achievement.achievement_type);
            return {
                achievement_id: achievement.achievement_id,
                title: achievement.title,
                description: achievement.description,
                date_achieved: achievement.date_achieved,
                employee_id: achievement.employee_id,
                achievement_type: translatedTypes, // Use the array of translated types here
            };
        }));

        console.log(JSON.stringify(response));

        res.status(201).json(response[0]); // Return the created achievement
    } catch (error) {
        console.error('Error creating achievement:', error);
        res.status(500).json({ error: 'Failed to create achievement' });
    }
}

exports.updateAchievement = async (req, res) => {
    const { achievement_id, title, description, date_achieved, achievement_type } = req.body;
    const employee_id = req.session.user.employee_id; 

    try {
        const achievement = await Achievement.getById(achievement_id);

        if (!achievement || achievement.employee_id !== employee_id) {
            return res.status(404).json({ error: 'Achievement not found or unauthorized' });
        }

        achievement.title = title;
        achievement.description = description;
        achievement.date_achieved = date_achieved;
        achievement.achievement_type = achievement_type;

        const updatedAchievement = await achievement.save(); // Save the new achievement

        const response = await Promise.all(updatedAchievement.map(async (achievement) => {
            const translatedTypes = await Achievement.translateAchievementtype(achievement.achievement_type);
            return {
                achievement_id: achievement.achievement_id,
                title: achievement.title,
                description: achievement.description,
                date_achieved: achievement.date_achieved,
                employee_id: achievement.employee_id,
                achievement_type: translatedTypes, // Use the array of translated types here
            };
        }));

        console.log(JSON.stringify(response));

        res.status(201).json(response[0]); // Return the created achievement
    } catch (error) {
        console.error('Error updating achievement:', error);
        res.status(500).json({ error: 'Failed to update achievement' });
    }
}

exports.deleteAchievement = async (req, res) => {
    const { achievement_id } = req.body;

    try {
        const achievement = await Achievement.getById(achievement_id); // Fetch the existing episode by ID

        if (!achievement || achievement.achievement_id !== achievement_id) {
            return res.status(404).json({ error: 'Achievement not found or unauthorized' });
        }

        const deletedAchievement = await achievement.delete(); // delete the episode

        res.status(200).json(deletedAchievement); // Return the delete episode
    } catch (error) {
        console.error('Error deleting achievement:', error);
        res.status(500).json({ error: 'Failed to delete achievement' });
    }
}
