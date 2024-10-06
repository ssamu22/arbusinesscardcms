const path = require('path');
const supabase = require('../utils/supabaseClient');
const Professor = require('../models/professor');

exports.edit = (req, res) => {
    res.render(path.join(__dirname, '../resources/views/pages/user/edits/editDetails.ejs'));
};

exports.getDetails = async (req, res) => {
    const userId = req.session.user.professor_id; // Get the user ID from the session
    try {
        const userInfo = await Professor.findProfessorById(userId); // Fetch user info from the database
        res.json({ 
            introduction: userInfo.introduction,
            position: userInfo.position,
            fields: userInfo.field
         }); // Send current introduction
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// exports.getIntroduction = async (req, res) => {
//     const userId = req.session.user.professor_id; // Get the user ID from the session
//     try {
//         const userInfo = await Professor.findProfessorById(userId); // Fetch user info from the database
//         res.json({ introduction: userInfo.introduction }); // Send current introduction
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

exports.updateDetails = async (req, res) => {
    const userId = req.session.user.professor_id; // Get the user ID from the session
    const { introduction, position, field } = req.body; // Get the new introduction from the request body

    try {
        const { error } = await supabase
            .from('professor')
            .update({ introduction, position, field }) // Update the introduction in the database
            .eq('professor_id', userId); // Match the user ID

        if (error) {
            throw error; // Handle error
        }

        req.session.user.position = position; // Update position in session

        res.status(200).json({ message: 'Introduction updated successfully!', });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update introduction.' });
    }
};

// exports.getPosition = async (req, res) => {
//     const userId = req.session.user.professor_id; // Get the user ID from the session
//     try {
//         const userInfo = await Professor.findProfessorById(userId); // Fetch user info from the database
//         res.json({ position: userInfo.position }); // Send current introduction
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };