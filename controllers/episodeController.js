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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createEpisode = async (req, res) => {
    const { date, description } = req.body;
    const employee_id = req.session.user.employee_id; 

    try {
        const newEpisode = new Episode(null, description, date, employee_id);
        const createdEpisode = await newEpisode.save(); // Save the new episode

        res.status(201).json(createdEpisode); // Return the created episode
    } catch (error) {
        console.error('Error creating episode:', error);
        res.status(500).json({ error: 'Failed to create episode' });
    }
}

exports.updateEpisode = async (req, res) => {
    const { episode_id, date, description } = req.body;
    const employee_id = req.session.user.employee_id; 

    try {
        const episode = await Episode.getById(episode_id); // Fetch the existing episode by ID

        if (!episode || episode.employee_id !== employee_id) {
            return res.status(404).json({ error: 'Episode not found or unauthorized' });
        }

        episode.date = date;
        episode.description = description;
        
        const updatedEpisode = await episode.save(); // Update the episode

        res.status(200).json(updatedEpisode); // Return the updated episode
    } catch (error) {
        console.error('Error updating episode:', error);
        res.status(500).json({ error: 'Failed to update episode' });
    }
};

exports.deleteEpisode = async (req, res) => {
    const { episode_id } = req.body;

    try {
        const episode = await Episode.getById(episode_id); // Fetch the existing episode by ID

        if (!episode || episode.episode_id !== episode_id) {
            return res.status(404).json({ error: 'Episode not found or unauthorized' });
        }

        const deletedEpisode = await episode.delete(); // delete the episode

        res.status(200).json(deletedEpisode); // Return the delete episode
    } catch (error) {
        console.error('Error deleting episode:', error);
        res.status(500).json({ error: 'Failed to delete episode' });
    }
}
