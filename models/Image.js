// models/Image.js
const supabase = require('../utils/supabaseClient')

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
          .from('image')
          .select('*')
          .eq('image_id', image_id)
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
          image_url: publicURL
        };
      } catch (err) {
        console.error(err.message);
        return null; // Return null if there was an error
      }
    }

    static async uploadImage(file, bucket, fileName) {
        try {
            if (!file || !bucket || !fileName) {
                throw new Error('Missing required parameters (file, bucket, fileName).');
            }

            const filePath = path.join(__dirname, '..', file.path);

            // Upload to Supabase storage
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, fs.createReadStream(filePath), {
                    contentType: file.mimetype,
                });

            if (error) {
                throw new Error(`Supabase upload error: ${error.message}`);
            }

            // Get the public URL of the uploaded file
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            // Simulate creating an image object in the database (replace with your database logic)
            const image_id = Date.now(); // Temporary unique ID (replace with DB logic)
            return new Image({
                image_id,
                bucket,
                file_name: fileName,
                url: publicUrlData.publicUrl,
            });
        } catch (error) {
            console.error('Error uploading image:', error.message);
            throw error;
        }
    }
  }

  
  
  module.exports = Image;