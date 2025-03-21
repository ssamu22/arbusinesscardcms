// models/Image.js
const fs = require("fs");
const path = require("path");
const supabase = require("../utils/supabaseClient");

class Image {
  constructor(image_id, image_bucket, image_filename, url) {
    this.image_id = image_id;
    this.image_bucket = image_bucket;
    this.image_filename = image_filename;
    this.url = url;
  }

  // Fetch image details by ID and generate its URL
  static async getImageById(image_id) {
    try {
      const { data, error } = await supabase
        .from("image")
        .select("*")
        .eq("image_id", image_id)
        .single();

      if (error) {
        throw new Error(`Failed to retrieve image: ${error.message}`);
      }

      // Generate the public URL for the image
      const { publicURL, error: urlError } = supabase.storage
        .from(data.image_bucket)
        .getPublicUrl(data.image_filename);

      if (urlError) {
        throw new Error(`Failed to generate image URL: ${urlError.message}`);
      }

      // Return the image data with the public URL
      return {
        image_url: publicURL,
      };
    } catch (err) {
      console.error(err.message);
      return null; // Return null if there was an error
    }
  }

  // Upload an image to Supabase and return an Image instance
  static async uploadImage(file, bucket, fileName) {
    try {
      if (!file || !bucket || !fileName) {
        throw new Error(
          "Missing required parameters (file, bucket, fileName)."
        );
      }

      const subBucket = bucket.replace(/^assets\//, "");

      // Resolve correct file path
      const filePath = path.resolve(file.path);

      // Check if the file size is valid (not empty)
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        throw new Error("File is empty.");
      }

      // Read the file as a buffer for upload
      const fileBuffer = fs.readFileSync(filePath);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype, // Ensure correct content type
          upsert: true, // Overwrite if the file already exists
        });

      if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
      }

      // Generate public URL for the uploaded image
      const { publicUrl, error: urlError } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (urlError) {
        throw new Error(
          `Failed to generate image public URL: ${urlError.message}`
        );
      }

      // Insert or update the image details in the 'image' table in Supabase database
      const { data: imageData, error: insertError } = await supabase
        .from("image") // Assuming your table name is 'image'
        .upsert(
          [
            // Use upsert to either insert a new row or update an existing one
            {
              image_bucket: bucket,
              image_filename: fileName,
            },
          ],
          { onConflict: ["image_id"] }
        ); // On conflict, update based on image_filename

      console.log("THE IMAGE DATA:", imageData);
      if (insertError) {
        throw new Error(
          `Error inserting/updating image record in database: ${insertError.message}`
        );
      }

      // Clean up temporary file
      fs.unlinkSync(filePath);

      // Return the inserted/updated image details
      return {
        image_id: imageData[0].image_id, // Return the inserted/updated image ID from DB
        bucket,
        fileName,
        url: publicUrl,
      };
    } catch (error) {
      console.error("Error uploading image:", error.message);
      throw error;
    }
  }
}

module.exports = Image;
