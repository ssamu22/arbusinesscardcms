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

  // Fetch a single consultation_type by ID
  static async getById(contype_id) {
    const { data, error } = await supabase
      .from('consultation_type')
      .select('*')
      .eq('contype_id', contype_id)
      .single();

    if (error) {
      console.error(`Error fetching consultation type with ID ${contype_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new Consultation_type(data.contype_id, data.consultation, data.description, data.employee_id);
  }

  async save() {
    if (this.contype_id) { 
        const { data, error } = await supabase
            .from('consultation_type')
            .update({
                consultation: this.consultation,
                description: this.description,
            })
            .eq('contype_id', this.contype_id);

        if (error) {
            console.error('Error updating consultation_type:', error);
            throw error;
        }

        return data[0]; // Return updated consultation_type
    } else { // Insert new schedule
        // Insert new schedule logic
        const { data, error } = await supabase
            .from('consultation_type')
            .insert({
                consultation: this.consultation,
                description: this.description,
                employee_id: this.employee_id,
            });

        console.log('Insert response:', { data, error });

        if (error) {
            console.error('Error inserting consultation_type:', error);
            throw error; // Throw error to be caught in the controller
        }

        return data[0]; // Return the newly inserted schedule
    }
  }

}

module.exports = Consultation_type;