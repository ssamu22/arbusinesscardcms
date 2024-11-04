// models/employee_schedule.js
const supabase = require('../utils/supabaseClient')

class Employee_schedule {
  constructor(schedule_id, employee_id, start_time, end_time, day, available ) {
    this.schedule_id = schedule_id;
    this.start_time = start_time;
    this.end_time = end_time;
    this.employee_id = employee_id;
    this.day = day;
    this.available = available;
  }

  // fetch all employee_schedules of employee
  static async getAllSchedule(employee) {
    try {
        const { data, error } = await supabase
            .from('employee_schedule')
            .select('*')
            .eq('employee_id', employee);

        if (error) {
            throw new Error(`Failed to retrieve employee_schedules: ${error.message}`);
        }

        // Check if data is an array and map to employee_schedule instances
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

  // Fetch a single employee_schedule by ID
  static async getById(schedule_id) {
    const { data, error } = await supabase
      .from('employee_schedule')
      .select('*')
      .eq('schedule_id', schedule_id)
      .single();

    if (error) {
      console.error(`Error fetching schedule with ID ${schedule_id}:`, error);
      throw error;
    }

    if (!data) return null; // Return null if not found

    return new Employee_schedule(data.schedule_id, data.employee_id, data.start_time, data.end_time, data.day, data.available);
  }

  // Save the current instance (create or update)
  async save() {
    if (this.schedule_id) { // Check if the schedule_id is defined for updating
        const { data, error } = await supabase
            .from('employee_schedule')
            .update({
                start_time: this.start_time,
                end_time: this.end_time,
                available: this.available,
            })
            .eq('schedule_id', this.schedule_id);

        if (error) {
            console.error('Error updating employee_schedule:', error);
            throw error;
        }

        return data[0]; // Return updated employee_schedule
    } else { // Insert new schedule
        // Insert new schedule logic
        const { data, error } = await supabase
            .from('employee_schedule')
            .insert({
                employee_id: this.employee_id,
                day: this.day,
                start_time: this.start_time,
                end_time: this.end_time,
                available: this.available,
            });

        console.log('Insert response:', { data, error });

        if (error) {
            console.error('Error inserting employee_schedule:', error);
            throw error; // Throw error to be caught in the controller
        }

        return data[0]; // Return the newly inserted schedule
    }
  }
  
}

module.exports = Employee_schedule;