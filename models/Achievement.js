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

  // Fetch a single episode by ID
  static async getById(episode_id) {
    const { data, error } = await supabase
      .from('episode')
      .select('*')
      .eq('episode_id', episode_id)
      .single();

    if (error) {
      console.error(`Error fetching episode with ID ${episode_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new Episode(data.episode_id, data.description, data.date, data.employee_id);
  }

  // Save the current instance (create or update)
  async save() {
    if (this.achievement_id) {
      // Update an existing episode
    //   const { data, error } = await supabase
    //     .from('achievement')
    //     .update({
    //       description: this.description,
    //       date: this.date
    //     })
    //     .eq('achievement_id', this.achievement_id);
  
    //   if (error) {
    //     console.error('Error updating achievement:', error);
    //     throw error;
    //   }
  
    //   return data[0]; // Return updated episode
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

  // Delete the current episode instance
  async delete() {
    if (!this.episode_id) {
      throw new Error('Episode ID is required to delete');
    }

    const { data, error } = await supabase
      .from('episode')
      .delete()
      .eq('episode_id', this.episode_id);

    if (error) {
      console.error(`Error deleting episode with ID ${this.episode_id}:`, error);
      throw error;
    }

    return data;
  }
  
}

module.exports = Achievement;