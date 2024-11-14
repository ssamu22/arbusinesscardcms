// models/Organization.js
const supabase = require('../utils/supabaseClient')

class Organization{
  constructor(organization_id, org_name, employee_id, org_type, image_id) {
    this.organization_id = organization_id;
    this.org_name = org_name;
    this.employee_id = employee_id;
    this.org_type = org_type;
    this.image_id = image_id;
  }

  // fetch all organization of employee
  static async getAllorganization(employee) {
    try {
        const { data, error } = await supabase
            .from('organization')
            .select('*')
            .eq('employee_id', employee);

        if (error) {
            throw new Error(`Failed to retrieve organizations: ${error.message}`);
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

  // Fetch a single organization by ID
  static async getById(organization_id) {
    console.log(`Getting ${organization_id}`);
    const { data, error } = await supabase
      .from('organization')
      .select('*')
      .eq('organization_id', organization_id)
      .single();

      console.log(data);

    if (error) {
      console.error(`Error fetching organization with ID ${organization_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new organization(data.organization_id, data.title, data.description, data.date_achieved, data.employee_id, data.organization_type);
  }

  // Save the current instance (create or update)
  async save() {
    if (this.organization_id) {
      // Update an existing organization
      const { data, error } = await supabase
        .from('organization')
        .update({
            title: this.title,
            description: this.description,
            date_achieved: this.date_achieved,
            organization_type: this.organization_type
        })
        .eq('organization_id', this.organization_id);
  
      if (error) {
        console.error('Error updating organization:', error);
        throw error;
      }

      return data; // Return updated episode
    } else {
      // Create a new organization
      const { data, error } = await supabase
        .from('organization')
        .insert({
            org_name: this.org_name,
            employee_id: this.employee_id,
            org_type: this.org_type,
            image_id: this.image_id,
        });
  
      if (error) {
        console.error('Error creating organization:', error);
        throw error;
      }
  
      this.organization_id = data[0].organization_id; // Set the ID after creation
      return data; // Return created organization
    }
  }

  // Delete the current organization instance
  async delete() {
    if (!this.organization_id) {
      throw new Error('organization ID is required to delete');
    }

    const { data, error } = await supabase
      .from('organization')
      .delete()
      .eq('organization_id', this.organization_id);

    if (error) {
      console.error(`Error deleting organization with ID ${this.organization_id}:`, error);
      throw error;
    }

    return data;
  }
  
}

module.exports = Organization;