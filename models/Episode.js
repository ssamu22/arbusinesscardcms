// models/Episode.js
const supabase = require('../utils/supabaseClient')

class Episode {
  constructor(episode_id, description, date, employee_id) {
    this.episode_id = episode_id;
    this.description = description;
    this.date = date;
    this.employee_id = employee_id;
  }

  // fetch all episodes of employee
  static async getAllEpisode(employee) {
    try {
        const { data, error } = await supabase
            .from('episode')
            .select('*')
            .eq('employee_id', employee);

        if (error) {
            throw new Error(`Failed to retrieve episodes: ${error.message}`);
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

module.exports = Episode;