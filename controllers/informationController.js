const path = require('path');
const supabase = require('../utils/supabaseClient');
const Employee = require('../models/Employee');

exports.getDetails = async (req, res) => {
    const employee_id = req.session.user.employee_id; // Get the user ID from the session
    try {
        const userInfo = await Employee.getOverviewData(employee_id); // Fetch user info from the database
        res.json({ 
            introduction: userInfo.introduction,
            position: userInfo.position,
            fields: userInfo.field
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
