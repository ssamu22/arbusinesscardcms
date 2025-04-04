const supabase = require("../utils/supabaseClient");

class LpuBranch {
  constructor(
    vision,
    mission,
    core_values,
    philosophy,
    location,
    date,
    branch_name,
    video_bucket,
    video_filename
  ) {
    this.vision = vision;
    this.mission = mission;
    this.core_values = core_values;
    this.philosophy = philosophy;
    this.location = location;
    this.date = date;
    this.branch_name = branch_name;
    this.video_bucket = video_bucket;
    this.video_filename = video_filename;
  }

  static async getBranch(lpu_branch_id) {
    const id = parseInt(lpu_branch_id);
    if (isNaN(id)) {
      console.error("Invalid ID:", lpu_branch_id);
      return null;
    }

    const { data, error } = await supabase
      .from("lpu_branch")
      .select("*")
      .eq("lpu_branch_id", id)
      .single();

    if (error) {
      console.error("Error fetching branch:", error);
      return null;
    }

    return data;
  }

  static async updatePrinciple(id, principle, newText) {
    console.log(id);
    console.log(principle);
    const validPrinciples = ["vision", "mission", "core_values", "philosophy"];
    if (!validPrinciples.includes(principle)) {
      console.error(`Invalid principle: ${principle}`);
      return { error: "Invalid principle" };
    }

    const { data, error } = await supabase
      .from("lpu_branch")
      .update({ [principle]: newText })
      .eq("lpu_branch_id", parseInt(id));

    console.log("THE UPDATED PRINCIPLE: ", data);

    if (error) {
      console.error("Error updating principle:", error);
      return { error: error.message };
    }

    return { success: true, data };
  }
}

module.exports = LpuBranch;
