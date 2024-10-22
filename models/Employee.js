// models/Professor.js
const supabase = require('../utils/supabaseClient');
const bcrypt = require('bcrypt'); // For password hashing

class Employee {
    // Private properties
    #password;
    #email;

    constructor(employeeData) {
        // Public fields
        this.employee_id = employeeData.employee_id;
        this.first_name = employeeData.first_name;
        this.middle_name = employeeData.middle_name;
        this.last_name = employeeData.last_name;
        this.honorifics = employeeData.honorifics;
        this.field = employeeData.field;
        this.introduction = employeeData.introduction;
        this.image_id = employeeData.image_id;
        this.position = employeeData.position;
        this.department_id = employeeData.department_id;

        // Private fields
        this.#password = employeeData.password;
        this.#email = employeeData.email;
    }

    // Public Getter for email
    getEmail() {
        return this.#email;
    }

    // Private Getter for password
    #getPassword() {
        return this.#password;
    }

    // Public method to check the password
    async validatePassword(plainPassword) {
        const hashedPassword = this.#getPassword(); // Access private method
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Public Setter for password
    setPassword(newPassword) {
        this.#password = newPassword;
    }

    // Create a new employee
    static async create(employeeData) {
        try {
            const { data, error } = await supabase
                .from('employee')
                .insert([employeeData]);

            if (error) {
                throw new Error(`Failed to create employee: ${error.message}`);
            }
            return new Employee(data[0]); // Return a new instance of Employee
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

    // Read an employee by ID
    static async findById(employee_id) {
        try {
            const { data, error } = await supabase
                .from('employee')
                .select('*')
                .eq('employee_id', employee_id)
                .single();

            if (error) {
                throw new Error(`Failed to retrieve employee: ${error.message}`);
            }
            return new Employee(data); // Return an instance of Employee
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

    // Update employee details
    static async update(employee_id, updateData) {
        try {
            console.log(updateData);
            const { data, error } = await supabase
                .from('employee')
                .update(updateData)
                .eq('employee_id', employee_id);

            if (error) {
                throw new Error(`Failed to update employee: ${error.message}`);
            }
            return data[0] ? new Employee(data[0]) : null; // Return updated Employee instance
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

    // Delete an employee
    static async delete(employee_id) {
        try {
            const { error } = await supabase
                .from('employee')
                .delete()
                .eq('employee_id', employee_id);

            if (error) {
                throw new Error(`Failed to delete employee: ${error.message}`);
            }
            return true;
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

    // List all employees (without private fields)
    static async listAll() {
        try {
            const { data, error } = await supabase
                .from('employee')
                .select('employee_id, first_name, middle_name, last_name, honorifics, field, introduction, image_id, position, department_id');

            if (error) {
                throw new Error(`Failed to list employees: ${error.message}`);
            }
            return data.map(empData => new Employee(empData)); // Return array of Employee instances
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

    // Find employee by email
    static async findByEmail(email) {
      try {
          const { data, error } = await supabase
              .from('employee')
              .select('*')
              .eq('email', email)
              .single(); // Ensure we get a single record

          if (error) {
              throw new Error(`Failed to retrieve employee by email: ${error.message}`);
          }
          return new Employee(data); // Return the Employee instance
      } catch (err) {
          console.error(err.message);
          return null; // Return null if employee not found
      }
  }

  // Retrieve data for overview page
  static async getOverviewData(employee_id) {
    try {
        const { data, error } = await supabase
            .from('employee')
            .select('introduction, field, position')
            .eq('employee_id', employee_id)
            .single(); // Ensure we get a single record

        if (error) {
            throw new Error(`Failed to retrieve employee by email: ${error.message}`);
        }
        return new Employee(data); // Return the Employee instance
    } catch (err) {
        console.error(err.message);
        return null; // Return null if employee not found
    }
  }
}

module.exports = Employee;
