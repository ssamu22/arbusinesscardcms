// models/Achievement_type.js
const supabase = require('../utils/supabaseClient')

class Achievement_type{
  constructor(achievement_id, name) {
    this.achievement_id = achievement_id;
    this.name = name;
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

  
}

module.exports = Achievement_type;