const path = require('path');
const supabase = require('../utils/supabaseClient');
const Achievement = require('../models/Achievement');

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
