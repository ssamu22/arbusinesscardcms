// models/Consultation_type.js
const supabase = require('../utils/supabaseClient')

class Consultation_type{
  constructor(contype_id, consultation, description, employee_id) {
    this.contype_id = contype_id;
    this.consultation = consultation;
    this.description = description;
    this.employee_id = employee_id;
  }

  // fetch all consultation of employee
  static async getAllConsultationType(employee_id) {
    try {
        const { data, error } = await supabase
            .from('consultation_type')
            .select('*')
            .eq('employee_id', employee_id);

        if (error) {
            throw new Error(`Failed to retrieve consultation types: ${error.message}`);
        }

        // Check if data is an array and map to Episode instances
        if (Array.isArray(data)) {
            return data;
        } else {
            // If data is not an array, return an empty array
            return [];
        }
    } catch (err) {
        console.error(err.message);
        return null; // Return null if there was an error
    }
  }

}

module.exports = Consultation_type;