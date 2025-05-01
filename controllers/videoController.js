const supabase = require("../utils/supabaseClient");
const Employee_schedule = require("../models/Employee_schedule");
const Consultation_type = require("../models/Consultation_type");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Create this directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

exports.getAllVideos = async (req, res) => {
  console.log("GETTING VIDEOS!");
  try {
    const { data, error } = await supabase.from("video").select("*");

    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve videos.",
        error: error.message,
      });
    }

    // Add public URL for each video
    const videosWithUrls = data.map((video) => {
      const bucketName = video.video_bucket.split("/")[0]; // "assets"
      const filePath = video.video_bucket
        .split("/")
        .slice(1)
        .concat(video.video_filename)
        .join("/"); // "videos/watchasay.mp4"

      const { publicURL } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        ...video,
        public_url: publicURL,
      };
    });

    res.status(200).json({
      status: "success",
      message: "All videos successfully retrieved!",
      data: videosWithUrls,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred.",
    });
  }
};

exports.getVideo = async (req, res) => {
  console.log("GETTING SPECIFIC VIDEO");
  try {
    const { data, error } = await supabase
      .from("video")
      .select("*")
      .eq("video_id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        status: "error",
        message: "Video not found.",
        error: error?.message || "No data found",
      });
    }

    // Construct public URL
    const bucketName = data.video_bucket.split("/")[0]; // "assets"
    const filePath = data.video_bucket
      .split("/")
      .slice(1)
      .concat(data.video_filename)
      .join("/"); // "videos/watchasay.mp4"

    const { publicURL } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    res.status(200).json({
      status: "success",
      message: "Video retrieved successfully!",
      data: {
        ...data,
        public_url: publicURL,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred.",
    });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const updateData = req.body;

    // If a file is uploaded, upload it to Supabase Storage
    if (req.file) {
      const bucket = "assets";
      const folder = "videos";
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const fullPath = `${folder}/${fileName}`;

      // Read file buffer from disk
      const fileBuffer = fs.readFileSync(req.file.path);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("assets/videos")
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      // Delete the file from local disk
      fs.unlinkSync(req.file.path);

      if (uploadError) {
        return res.status(500).json({
          status: "error",
          message: "Failed to upload video to storage.",
          error: uploadError.message,
        });
      }

      // Update video_bucket and video_filename
      updateData.video_bucket = `${bucket}/${folder}`;
      updateData.video_filename = fileName;
    }

    // Update the row in Supabase
    const { data, error } = await supabase
      .from("video")
      .update(updateData)
      .eq("video_id", videoId)
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({
        status: "error",
        message: "Failed to update video.",
        error: error?.message || "No data found",
      });
    }

    // Get public URL
    const { publicURL } = supabase.storage
      .from(updateData.video_bucket.split("/")[0])
      .getPublicUrl(
        `${updateData.video_bucket.split("/").slice(1).join("/")}/${
          updateData.video_filename
        }`
      );

    res.status(200).json({
      status: "success",
      message: "Video updated successfully!",
      data: {
        ...data,
        public_url: publicURL,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred.",
    });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { error } = await supabase
      .from("video")
      .delete()
      .eq("video_id", req.params.id);

    if (error) {
      return res.status(400).json({
        status: "error",
        message: "Failed to delete video.",
        error: error.message,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Video deleted successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred.",
    });
  }
};

// static async getImageById(image_id) {
//     try {
//       const { data, error } = await supabase
//         .from("image")
//         .select("*")
//         .eq("image_id", image_id)
//         .single();

//       if (error) {
//         throw new Error(`Failed to retrieve image: ${error.message}`);
//       }

//       // Generate the public URL for the image
//       const { publicURL, error: urlError } = supabase.storage
//         .from(data.image_bucket)
//         .getPublicUrl(data.image_filename);

//       if (urlError) {
//         throw new Error(`Failed to generate image URL: ${urlError.message}`);
//       }

//       // Return the image data with the public URL
//       return {
//         image_url: publicURL,
//       };
//     } catch (err) {
//       console.error(err.message);
//       return null; // Return null if there was an error
//     }
//   }
