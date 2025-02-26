const supabase = require("../utils/supabaseClient");

class Event {
  constructor(event_id, image_id, event_name, date, event_desc) {
    this.event_id = event_id;
    this.image_id = image_id;
    this.event_name = event_name;
    this.date = date;
    this.event_desc = event_desc;
  }

  static async getAllEvents() {
    try {
      const { data, error } = await supabase.from("event").select("*");
      console.log(data); // Check the structure of the fetched data

      if (error) {
        throw new Error(`Failed to list employees: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async addEvent(newData) {
    const { data, error } = await supabase.from("event").insert([newData]);

    if (error) {
      console.error(`Error: ${error}`);
    }

    return { success: true, data };
  }

  static async updateEvent(event_id, newData) {
    const { data, error } = await supabase
      .from("event")
      .update(newData)
      .eq("event_id", event_id);

    if (error) {
      console.error(`Error:`, error);
    }

    return { success: true, data };
  }

  static async deleteEvent(event_id) {
    const { data, error } = await supabase
      .from("event")
      .delete()
      .eq("event_id", event_id);
  }
  if(error) {
    console.error(`Error: ${error}`);
  }
}

module.exports = Event;
