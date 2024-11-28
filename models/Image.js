const supabase = require("../utils/supabaseClient");

class Image {
  constructor(imageBucket, imageFileName) {
    this.imageBucket = imageBucket;
    this.imageFileName = imageFileName;
  }

  static async getImage(image_id) {
    // Array of paths to the images inside your 'assets/awardImages' bucket
    // Generate signed URLs valid for 60 seconds

    const { data: imageData, error: imageError } = await supabase
      .from("image")
      .select("image_bucket, image_filename")
      .eq("image_id", image_id)
      .single();

    if(!imageData){
      console.error("Image is not in the database!");
      return null;
    }
    const imageBucket = imageData.image_bucket.split("/");
    const fname = `${imageBucket[1]}/${imageData.image_filename}`;
    // console.log(fname);
    const { data, error } = await supabase.storage
      .from(imageBucket[0]) // Bucket and folder name
      .createSignedUrls([fname], 60);

    if (error) {
      console.error("Error generating signed URLs:", error);
      return;
    }

    // Output the signed URLs
    data.forEach((file) => {
      console.log(`File: ${file.path}`);
      console.log(`Signed URL: ${file.signedURL}`);
    });

    return data; // Returning data if needed for further processing
  }
}

module.exports = Image;
