// models/Faq.js
const supabase = require('../utils/supabaseClient')

class Faq {
  constructor(faq_id, question, answer) {
    this.faq_id = faq_id;
    this.question = question;
    this.answer = answer;
  }

  // fetch all faq
  static async getAllFaq() {
    try {
        const { data, error } = await supabase
            .from('faq')
            .select('*');

        if (error) {
            throw new Error(`Failed to retrieve faq: ${error.message}`);
        }

        // Check if data is an array and map to faq instances
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

module.exports = Faq;