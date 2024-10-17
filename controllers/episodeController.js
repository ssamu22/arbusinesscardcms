const path = require('path');
const supabase = require('../utils/supabaseClient');
const Episode = require('../models/Episode');

exports.getEpisodes = async (req, res) => {
    const employee_id = req.session.user.employee_id; // Get the user ID from the session
    try {
        const timelines = await Episode.getAllEpisode(employee_id); // Fetch user info from the database

        // Check if any timelines were retrieved
        if (!timelines || timelines.length === 0) {
            return res.status(404).json({ message: 'No episodes found for this employee.' });
        }

        const response = timelines.map(timeline => ({
            episode_id: timeline.episode_id,
            description: timeline.description,
            date: timeline.date
        }));

        res.json(response); 
        console.log("Response: "+ JSON.stringify(response));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
