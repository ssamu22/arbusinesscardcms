// models/Admin.js
const supabase = require("../utils/supabaseClient");
const bcrypt = require("bcrypt"); // For password hashing

class Admin {
  // Private properties
  #password;
  #email;

  constructor(adminData) {
    // Public fields
    this.admin_id = adminData.admin_id;
    this.admin_name = adminData.admin_name;
    this.image_id = adminData.image_id;
    this.date_created = adminData.date_created;
    // Private fields
    this.#password = adminData.password;
    this.#email = adminData.email;
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

  // Read an admin by ID
  static async findById(admin_id) {
    try {
      const { data, error } = await supabase
        .from("admin")
        .select("*")
        .eq("admin_id", admin_id)
        .single();

      if (error) {
        throw new Error(`Failed to retrieve admin: ${error.message}`);
      }
      return new Admin(data); // Return an instance of admin
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  }

  static async listAll() {
    try {
      const { data, error } = await supabase
        .from("admin")
        .select(
          "admin_id, admin_name, email, image_id, date_created"
        );

      if (error) {
        throw new Error(`Failed to list admins: ${error.message}`);
      }
      return data.map((adminData) => new Admin(adminData)); // Return array of Employee instances
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  }

  // Find admin by email
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from("admin")
        .select("*")
        .eq("email", email)
        .single(); // Ensure we get a single record

      if (error) {
        throw new Error(`Failed to retrieve admin by email: ${error.message}`);
      }
      return new Admin(data); // Return the admin instance
    } catch (err) {
      console.error(err.message);
      return null; // Return null if admin not found
    }
  }

  // Delete an admin
  async delete() {
    if (!this.admin_id) {
      throw new Error("admin ID is required to delete");
    }

    const { data, error } = await supabase
      .from("admin")
      .delete()
      .eq("admin_id", this.admin_id);

    if (error) {
      console.error(`Error deleting admin with ID ${this.admin_id}:`, error);
      throw error;
    }

    return data;
  }
}

module.exports = Admin;
