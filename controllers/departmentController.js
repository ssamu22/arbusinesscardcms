const path = require('path');
const supabase = require('../utils/supabaseClient');
const Professor = require('../models/Department');

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

// Update professor's department
exports.updateProfessorDepartment = async (req, res) => {
    const userId = req.session.user.professor_id;
    const { department_id } = req.body;

    try {
        const { error } = await supabase
            .from('professor')
            .update({ department_id })
            .eq('professor_id', userId);

        if (error) throw error;

        // Update session department
        req.session.user.department_id = department_id;

        res.status(200).json({ message: 'Department updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update department.' });
    }
};