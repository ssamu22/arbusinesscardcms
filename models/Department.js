// models/Department.js
const supabase = require('../utils/supabaseClient')

class Department {
  constructor(department_id, department_name, college_id, acronym) {
    this.department_id = department_id;
    this.department_name = department_name;
    this.college_id = college_id;
    this.acronym = acronym;
  }

  // Instance Methods: These will operate on the instance of the department (e.g., saving an instance)
  
  // Save the current instance (create or update)
  async save() {
    if (this.department_id) {
      // Update an existing department
      const { data, error } = await supabase
        .from('department')
        .update({
          department_name: this.department_name,
          college_id: this.college_id,
          acronym: this.acronym
        })
        .eq('department_id', this.department_id);
      
      if (error) {
        console.error('Error updating department:', error);
        throw error;
      }

      return data;
    } else {
      // Create a new department
      const { data, error } = await supabase
        .from('department')
        .insert({
          department_name: this.department_name,
          college_id: this.college_id,
          acronym: this.acronym
        });

      if (error) {
        console.error('Error creating department:', error);
        throw error;
      }

      this.department_id = data[0].department_id; // Set the ID after creation
      return data;
    }
  }

  // Delete the current department instance
  async delete() {
    if (!this.department_id) {
      throw new Error('Department ID is required to delete');
    }

    const { data, error } = await supabase
      .from('department')
      .delete()
      .eq('department_id', this.department_id);

    if (error) {
      console.error(`Error deleting department with ID ${this.department_id}:`, error);
      throw error;
    }

    return data;
  }

  // Static Methods: These will be used for general CRUD operations (fetching departments)

  // Fetch all departments
  static async getAll() {
    const { data, error } = await supabase
      .from('department')
      .select('*');

    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }

    return data.map(dept => new Department(dept.department_id, dept.department_name, dept.college_id, dept.acronym));
  }

  // Fetch a single department by ID
  static async getById(department_id) {
    const { data, error } = await supabase
      .from('department')
      .select('*')
      .eq('department_id', department_id)
      .single();

    if (error) {
      console.error(`Error fetching department with ID ${department_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new Department(data.department_id, data.department_name, data.college_id, data.acronym);
  }
}

module.exports = Department;
