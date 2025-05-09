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
      const { data, error } = await supabase
      .from("event")
      .select("*")
      .eq("is_archived", false);
      console.log(data); // Check the structure of the fetched data

      if (error) {
        throw new Error(`Failed to list events: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async getArchivedEvents() {
    try {
      const { data, error } = await supabase
      .from("event")
      .select("*")
      .eq("is_archived", true);
      console.log(data); // Check the structure of the fetched data

      if (error) {
        throw new Error(`Failed to list events: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async archiveEvent(event_id, is_archived){
    try {
      const { data, error } = await supabase
      .from("event")
      .update({ is_archived: is_archived })
      .eq("event_id", event_id);

      if (error) {
        console.error(`Error:`, error);
      }

      return data;
    } catch (error) {
      console.error(err.message);
      throw err;
    } 
  }

  static async getEventById(event_id) {
    try {
      const { data, error } = await supabase
      .from("event")
      .select("*")
      .eq("event_id", event_id)
      .single();

      if (error) {
        throw new Error(`Failed to list events: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.log(err);
      return null;
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

      if(error) {
        console.error(`Error: ${error}`);
      }
  }
  
}

module.exports = Event;
