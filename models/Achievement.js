// models/Achievement.js
const supabase = require('../utils/supabaseClient')

class Achievement{
  constructor(achievement_id, title, description, date_achieved, employee_id, achievement_type) {
    this.achievement_id = achievement_id;
    this.title = title;
    this.description = description;
    this.date_achieved = date_achieved;
    this.employee_id = employee_id;
    this.achievement_type = achievement_type;
  }

  // fetch all achievement of employee
  static async getAllAchievement(employee) {
    try {
        const { data, error } = await supabase
            .from('achievement')
            .select('*')
            .eq('employee_id', employee)
            .order('date_achieved', { ascending: true });

        if (error) {
            throw new Error(`Failed to retrieve achievements: ${error.message}`);
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

  static async translateAchievementtype(id){
    try{
      const { data, error } = await supabase
        .from('achievement_type')
        .select('name')
        .eq('achievement_id', id);
      
      if(error) {
        throw new Error(`Failed to retrieve achievement type: ${error.message}`);
      }
      
      if(Array.isArray(data)) {
        return data[0].name;
      } else {
        return null; // Return null if not found
      }
    } catch(err) {
      console.error(err.message);
      return null; // Return null if there was an error
    }
  }

  // Fetch a single achievement by ID
  static async getById(achievement_id) {
    console.log(`Getting ${achievement_id}`);
    const { data, error } = await supabase
      .from('achievement')
      .select('*')
      .eq('achievement_id', achievement_id)
      .single();

      console.log(data);

    if (error) {
      console.error(`Error fetching achievement with ID ${achievement_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new Achievement(data.achievement_id, data.title, data.description, data.date_achieved, data.employee_id, data.achievement_type);
  }

  // Save the current instance (create or update)
  async save() {
    if (this.achievement_id) {
      // Update an existing achievement
      const { data, error } = await supabase
        .from('achievement')
        .update({
            title: this.title,
            description: this.description,
            date_achieved: this.date_achieved,
            achievement_type: this.achievement_type
        })
        .eq('achievement_id', this.achievement_id);
  
      if (error) {
        console.error('Error updating achievement:', error);
        throw error;
      }

      return data; // Return updated episode
    } else {
      // Create a new achievement
      const { data, error } = await supabase
        .from('achievement')
        .insert({
          title: this.title,
          description: this.description,
          date_achieved: this.date_achieved,
          employee_id: this.employee_id,
          achievement_type: this.achievement_type
        });
  
      if (error) {
        console.error('Error creating achievement:', error);
        console.log("Data attempted to insert: ", {
            title: this.title,
            description: this.description,
            date_achieved: this.date_achieved,
            employee_id: this.employee_id,
            achievement_type: this.achievement_type
        });
        throw error;
      }
  
      this.achievement_id = data[0].achievement_id; // Set the ID after creation
      return data; // Return created achievement
    }
  }

  // Delete the current achievement instance
  async delete() {
    if (!this.achievement_id) {
      throw new Error('Achievement ID is required to delete');
    }

    const { data, error } = await supabase
      .from('achievement')
      .delete()
      .eq('achievement_id', this.achievement_id);

    if (error) {
      console.error(`Error deleting achievement with ID ${this.achievement_id}:`, error);
      throw error;
    }

    return data;
  }
  
}

module.exports = Achievement;