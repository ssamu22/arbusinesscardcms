const supabase = require("../utils/supabaseClient");

class Award {
  constructor(awardTitle, awardCategory, lpuBranchId, imageId) {
    this.awardTitle = awardTitle;
    this.awardCategory = awardCategory;
    this.lpuBranchId = lpuBranchId;
    this.imageId = imageId;
  }

  static async getAwards() {
    const { data, error } = await supabase.from("award").select("*");
    if (error) {
      console.error(`Error retrieving awards: ${error}`);
      return null;
    }
    return data;
  }

  // static async getBranch(lpu_branch_id) {
  //   const id = parseInt(lpu_branch_id);
  //   if (isNaN(id)) {
  //     console.error("Invalid ID:", lpu_branch_id);
  //     return null;
  //   }

  //   const { data, error } = await supabase
  //     .from("lpu_branch")
  //     .select("*")
  //     .eq("lpu_branch_id", id)
  //     .single();

  //   if (error) {
  //     console.error("Error fetching branch:", error);
  //     return null;
  //   }

  //   return data;
  // }

  //   static async updatePrinciple(id, principle, newText) {
  //     console.log(id);
  //     console.log(principle);
  //     const validPrinciples = ["vision", "mission", "core_values", "philosophy"];
  //     if (!validPrinciples.includes(principle)) {
  //       console.error(`Invalid principle: ${principle}`);
  //       return { error: "Invalid principle" };
  //     }

  //     const { data, error } = await supabase
  //       .from("lpu_branch")
  //       .update({ [principle]: newText })
  //       .eq("lpu_branch_id", parseInt(id));

  //     if (error) {
  //       console.error("Error updating principle:", error);
  //       return { error: error.message };
  //     }

  //     return { success: true, data };
  //   }
}

module.exports = Award;
