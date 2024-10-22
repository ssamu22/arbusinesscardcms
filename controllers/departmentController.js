const path = require('path');
const supabase = require('../utils/supabaseClient');
const Employee = require('../models/Department');

// Fetch all departments
exports.getAllDepartments = async (req, res) => {
    try {
        const { data: departments, error } = await supabase
            .from('department')
            .select('department_id, department_name');

        if (error) throw error;

        res.status(200).json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};