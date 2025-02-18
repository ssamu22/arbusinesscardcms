// models/Achievement_type.js
const supabase = require('../utils/supabaseClient')

class Achievement_type{
  constructor(achievement_id, name, icon) {
    this.achievement_id = achievement_id;
    this.name = name;
    this.icon = icon;
  }

  // fetch all achievement types
  static async getAllAchievementType() {
    try {
        const { data, error } = await supabase
            .from('achievement_type')
            .select('*');

        if (error) {
            throw new Error(`Failed to retrieve achievement types: ${error.message}`);
        }

        // Check if data is an array and map to achievement instances
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

  static async getById(achievement_id) {
    const { data, error } = await supabase
      .from('achievement_type')
      .select('*')
      .eq('achievement_id', achievement_id)
      .single();

    if (error) {
      console.error(`Error fetching achievement type with ID ${achievement_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new Achievement_type(data.achievement_id, data.name, data.icon);
  }

  async save() {
    if (this.achievement_id) {
      // Update an existing achievement type
      const { data, error } = await supabase
        .from('achievement_type')
        .update({
          name: this.name,
          icon: this.icon,
        })
        .eq('achievement_id', this.achievement_id);
      
      if (error) {
        console.error('Error updating achievement_type:', error);
        throw error;
      }

      return data;
    } else {
      // Create a new achievement type
      const { data, error } = await supabase
        .from('achievement_type')
        .insert({
          name: this.name,
          icon: this.icon,
        });

      if (error) {
        console.error('Error creating achievement_type:', error);
        throw error;
      }

      this.achievement_id = data[0].achievement_id; // Set the ID after creation
      return data;
    }
  }
  
  async delete() {
    if (!this.achievement_id) {
      throw new Error('Achievement ID is required to delete');
    }

    const { data, error } = await supabase
      .from('achievement_type')
      .delete()
      .eq('achievement_id', this.achievement_id);

    if (error) {
      console.error(`Error deleting achievement_type with ID ${this.achievement_id}:`, error);
      throw error;
    }

    return data;
  }

}



module.exports = Achievement_type;