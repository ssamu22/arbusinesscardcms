const supabase = require("../utils/supabaseClient");

class Image {
  constructor(imageBucket, imageFileName) {
    this.imageBucket = imageBucket;
    this.imageFileName = imageFileName;
  }

  static async getImage(image_id) {
    const { data: imageData, error: imageError } = await supabase
      .from("image")
      .select("image_bucket, image_filename")
      .eq("image_id", image_id)
      .single();

    if (!imageData) {
      console.error("Image is not in the database!");
      return null;
    }
    const imageBucket = imageData.image_bucket.split("/");
    const fname = `${imageBucket[1]}/${imageData.image_filename}`;
    const { data, error } = await supabase.storage
      .from(imageBucket[0])
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

  // static async getImages(imageIdsArray) {
  //   // Fetch unique image data for distinct image IDs
  //   const { data: imageData, error: imageError } = await supabase
  //     .from("image")
  //     .select("image_id, image_bucket, image_filename")
  //     .in("image_id", [...new Set(imageIdsArray)]); // Fetch unique IDs

  //   if (imageError) {
  //     console.error("Error fetching images:", imageError);
  //     return [];
  //   }

  //   // Create a mapping from image_id to its corresponding image object
  //   const imageMap = imageData.reduce((map, image) => {
  //     map[image.image_id] = image;
  //     return map;
  //   }, {});

  //   // Map the original array of IDs to the corresponding images
  //   const finalImageArray = imageIdsArray.map((id) => ({
  //     image_bucket: imageMap[id].image_bucket,
  //     image_filename: imageMap[id].image_filename,
  //   }));

  //   const fileArray = [];

  //   finalImageArray.forEach((fileMap) => {
  //     const imageBucket = fileMap.image_bucket.split("/");
  //     const fname = `${imageBucket[1]}/${fileMap.image_filename}`;
  //     fileArray.push(fname);
  //   });

  //   console.log(fileArray);

  //   return finalImageArray; // Return the array with duplicated items
  // }
}

module.exports = Image;
