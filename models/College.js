// models/College.js
const supabase = require('../utils/supabaseClient')

class College {
  constructor(college_id, name) {
    this.college_id = college_id;
    this.name = name;
  }
  
  // Save the current instance (create or update)
  async save() {
    if (this.college_id) {
      // Update an existing college
      const { data, error } = await supabase
        .from('college')
        .update({
          name: this.name,
        })
        .eq('college_id', this.college_id);
      
      if (error) {
        console.error('Error updating college:', error);
        throw error;
      }

      return data;
    } else {
      // Create a new college
      const { data, error } = await supabase
        .from('college')
        .insert({
          name: this.name,
        });

      if (error) {
        console.error('Error creating college:', error);
        throw error;
      }

      this.college_id = data[0].college_id; // Set the ID after creation
      return data;
    }
  }

  // Delete the current college instance
  async delete() {
    if (!this.college_id) {
      throw new Error('College ID is required to delete');
    }

    const { data, error } = await supabase
      .from('college')
      .delete()
      .eq('college_id', this.college_id);

    if (error) {
      console.error(`Error deleting college with ID ${this.college_id}:`, error);
      throw error;
    }

    return data;
  }

  // Static Methods: These will be used for general CRUD operations (fetching college)

  // Fetch all colleges
  static async getAll() {
    const { data, error } = await supabase
      .from('college')
      .select('*');

    if (error) {
      console.error('Error fetching colleges:', error);
      throw error;
    }

    return data.map(college => new College(college.college_id, college.name));
  }

  // Fetch a single college by ID
  static async getById(college_id) {
    const { data, error } = await supabase
      .from('college')
      .select('*')
      .eq('college_id', college_id)
      .single();

    if (error) {
      console.error(`Error fetching college with ID ${college_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new College(data.college_id, data.ame);
  }
}

module.exports = College;
