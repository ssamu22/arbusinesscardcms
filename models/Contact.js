// models/Contact.js
const supabase = require('../utils/supabaseClient')

class Contact {
  constructor(contact_id, employee_id, phone_number, landline, email, facebook_url, instagram_url, linkedin_url) {
    this.contact_id = contact_id;
    this.employee_id = employee_id;
    this.phone_number = phone_number;
    this.landline = landline;
    this.email = email;
    this.facebook_url = facebook_url;
    this.instagram_url = instagram_url;
    this.linkedin_url = linkedin_url;
  }

  // fetch all contacts of employee
  static async getAllContact(employee) {
    try {
        const { data, error } = await supabase
            .from('contact')
            .select('*')
            .eq('employee_id', employee);

        if (error) {
            throw new Error(`Failed to retrieve contacts: ${error.message}`);
        }

        // Check if data is an array and map to contact instances
        if (Array.isArray(data)) {
            return data[0];
        } else {
            // If data is not an array, return an empty array
            return [];
        }
    } catch (err) {
        console.error(err.message);
        return null; // Return null if there was an error
    }
  }

  // Fetch a single contact by ID
  static async getById(contact_id) {
    const { data, error } = await supabase
      .from('contact')
      .select('*')
      .eq('contact_id', contact_id)
      .single();

    if (error) {
      console.error(`Error fetching contact with ID ${contact_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new Contact(data.contact_id, data.employee_id, data.phone_number, data.landline, data.email, data.facebook_url, data.instagram_url, data.linkedin_url);
  }

  // Save the current instance (create or update)
  async save() {
    const { data, error } = await supabase
      .from('contact')
      .update({
        phone_number: this.phone_number,
        landline: this.landline,
        email: this.email,
        facebook_url: this.facebook_url,
        instagram_url: this.instagram_url,
        linkedin_url: this.linkedin_url,
      })
      .eq('contact_id', this.contact_id);

    if (error) {
      console.error('Error updating contact:', error);
      throw error;
    }

    return data[0]; // Return updated contact
    
  }
  
}

module.exports = Contact;