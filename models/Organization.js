// models/Organization.js
const supabase = require('../utils/supabaseClient')

class Organization{
  constructor(organization_id, org_name, employee_id, org_type, image_id, category, description, banner_id, position, date_joined, date_active) {
    this.organization_id = organization_id;
    this.org_name = org_name;
    this.employee_id = employee_id;
    this.org_type = org_type;
    this.image_id = image_id;
    this.category = category;
    this.description = description;
    this.banner_id = banner_id;
    this.position = position;
    this.date_joined = date_joined;
    this.date_active = date_active;
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

    return new Organization(data.organization_id, data.title, data.description, data.date_achieved, data.employee_id, data.organization_type);
  }

  // Save the current instance (create or update)
  async save() {
    if (this.organization_id) {
        // Dynamically construct update data to skip null or undefined values
        const updateData = {
          org_name: this.org_name,
          org_type: this.org_type,
          category: this.category,
          description: this.description,
          position: this.position,
          date_joined: this.date_joined,
          date_active: this.date_active,
        };

        // Only include image_id if it has a value
        if (this.image_id !== null && this.image_id !== undefined) {
            updateData.image_id = this.image_id;
        }

        // Only include banner_id if it has a value
        if (this.banner_id !== null && this.banner_id !== undefined) {
            updateData.banner_id = this.banner_id;
        }

        const { data, error } = await supabase
            .from('organization')
            .update(updateData)
            .eq('organization_id', this.organization_id);

        if (error) {
            console.error('Error updating organization:', error);
            throw error;
        }

        return data; // Return updated organization
    } else {
      // Create a new organization
      const { data, error } = await supabase
        .from('organization')
        .insert({
          org_name: this.org_name,
          employee_id: this.employee_id,
          org_type: this.org_type,
          image_id: this.image_id,
          category: this.category,
          description: this.description,
          banner_id: this.banner_id,
          position: this.position,
          date_joined: this.date_joined,
          date_active: this.date_active,
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