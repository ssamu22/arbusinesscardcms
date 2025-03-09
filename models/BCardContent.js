const supabase = require("../utils/supabaseClient");

class BCardContent {
  constructor(
    content_id,
    x,
    y,
    scaleFactor,
    type,
    fontSize,
    fontWeight,
    text,
    color,
    fontFamily
  ) {
    this.content_id = content_id;
    this.text = text;
    this.x = x;
    this.y = y;
    this.scaleFactor = scaleFactor;
    this.type = type;
    this.fontSize = fontSize;
    this.fontWeight = fontWeight;
    this.color = color;
    this.fontFamily = fontFamily;
  }

  // create a query middleware for getting all business card contents
  static async getAllBCardContent() {
    const { data, error } = await supabase.from("bcard_content").select("*");
  }

  static async addCardContent(
    text,
    x,
    y,
    scaleFactor,
    type,
    fontSize,
    fontWeight,
    color,
    fontFamily
  ) {
    const { data, error } = await supabase.from("bcard_content").insert({
      x: x,
      y: y,
      scale_factor: scaleFactor,
      type: type,
      text: text,
      color: color,
      font_size: fontSize,
      font_weight: fontWeight,
      font_family: fontFamily,
    });

    return data;
  }

  // create a middleware for updating business card contents
  static async updateBCardContent() {}
  // create a middleware for deleting business card contents
  static async deleteBCardContent() {}
}

module.exports = BCardContent;
