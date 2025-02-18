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
  // fetch a single faq by ID
  static async getById(faq_id) {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('faq_id', faq_id)
      .single();

    if (error) {
      console.error(`Error fetching faq with ID ${faq_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new Faq(data.faq_id, data.question, data.answer);
  }

  // update faq
  async save() {
    if (this.faq_id) {
      const { data, error } = await supabase
        .from('faq')
       .update({ question: this.question, answer: this.answer })
       .eq('faq_id', this.faq_id);
      
      if (error) {
        console.error(`Error updating faq with ID ${this.faq_id}:`, error);
        throw error;
      }
    } else {
      const { data, error } = await supabase
       .from('faq')
       .insert({ question: this.question, answer: this.answer });
      
      if (error) {
        console.error(`Error inserting new faq:`, error);
        throw error;
      }
      this.faq_id = data[0].faq_id;
    }
  }
}

module.exports = Faq;