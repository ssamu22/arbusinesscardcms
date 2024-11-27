const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const { Jimp } = require("jimp");
const path = require("path");

var vuforia = require("vuforia-api");

// exports.uploadFile = (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ message: "File upload failed", error: err });
//     }
//     console.log(req.file); // Use the file to upload it to storage (e.g., Firebase, AWS)
//     res
//       .status(201)
//       .json({ message: "File uploaded successfully", file: req.file });
//   });
// };

// init client with valid credentials
var client = vuforia.client({
  serverAccessKey: process.env.VUFORIA_SERVER_ACCESS_KEY,
  serverSecretKey: process.env.VUFORIA_SERVER_SECRET_KEY,
  clientAccessKey: process.env.VUFORIA_CLIENT_ACCESS_KEY,
  clientSecretKey: process.env.VUFORIA_CLIENT_SECRET_KEY,
});

// util for base64 encoding and decoding
var util = vuforia.util();

const applyHistogramEqualization = async (filePath, blendRatio = 0.8) => {
  try {
    const image = await Jimp.read(filePath);

    // Access the raw pixel data
    const { data: pixels, width, height } = image.bitmap;
    const histogram = new Array(256).fill(0);
    const cdf = new Array(256).fill(0);

    // Step 1: Compute Histogram
    for (let i = 0; i < pixels.length; i += 4) {
      const intensity = pixels[i]; // Grayscale (assuming already converted to grayscale)
      histogram[intensity]++;
    }

    // Step 2: Compute Cumulative Distribution Function (CDF)
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }

    // Normalize CDF (stretch to full range 0-255)
    const minCDF = cdf[0];
    const maxCDF = cdf[255];
    for (let i = 0; i < cdf.length; i++) {
      cdf[i] = Math.round(((cdf[i] - minCDF) * 255) / (maxCDF - minCDF));
    }

    // Step 3: Apply Equalization with Blending
    for (let i = 0; i < pixels.length; i += 4) {
      const intensity = pixels[i];
      const equalizedValue = Math.round(
        blendRatio * cdf[intensity] + (1 - blendRatio) * intensity
      );
      pixels[i] = pixels[i + 1] = pixels[i + 2] = equalizedValue; // RGB channels
    }

    // Save the modified image
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);

    // Ensure no duplicate "_equalized" in the file name
    const outputPath = path.join(
      dir,
      `${baseName.replace(/_equalized$/, "")}_equalized${ext}`
    );
    await image.write(outputPath);

    return path.basename(outputPath); // Return file name only
  } catch (error) {
    console.error("Error during histogram equalization:", error);
    throw error;
  }
};

// GET ALL CARDS
exports.getAllCards = (req, res) => {
  // This will retrieve all the target id's from the Vuforia cloud database
  client.listTargets(function (error, result) {
    if (error) {
      console.error(result);
    } else {
      console.log(result);
    }
  });

  res.status(200).json({
    status: "success",
    message: "Successfully retrieved all business cards!",
  });
};

// GET CARD
exports.getCard = (req, res) => {
  console.log(req.params.id);
  client.retrieveTarget(req.params.id, function (error, result) {
    if (error) {
      console.error(result);
    } else {
      console.log(result);
    }
  });
  res.status(200).json({
    status: "success",
    message: "Successfully retrieved card!",
  });
};

// UPLOAD
exports.uploadCard = async (req, res) => {
  // histogramName = await applyHistogramEqualization(req.file.path, 0.8);
  console.log(req.file);
  try {
    const target = {
      name: req.body.name,
      width: 6,
      image: util.encodeFileBase64(
        `${__dirname}/../uploads/markers/${req.file.originalname}`
      ),
      active_flag: req.body.active_flag === "true",
      application_metadata: util.encodeBase64(req.body.application_metadata),
    };

    client.addTarget(target, function (error, result) {
      if (error) {
        if (error == "Error: TargetNameExist") {
          console.log("MARKER ALREADY EXISTED!");
          return res.status(500).json({
            status: "error",
            message: "Marker already existed! Please upload another marker.",
          });
        }
        console.error("Error adding target:", error);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to add marker", error });
      } else {
        console.log("Target added:", result);
        return res.status(200).json({
          status: "success",
          message: "Marker successfully uploaded",
          result,
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Unexpected server error", error });
  }
};

// DELETE
exports.deleteCard = (req, res) => {
  // console.log(req.body.target_id);
  client.deleteTarget(req.body.target_id, function (error, result) {
    if (error) {
      console.error(result);
    } else {
      console.log(result);
    }
  });

  return res.status(200).json({
    status: "success",
    message: "Marker successfully deleted",
  });
};

// UPDATE
exports.updateCard = (req, res) => {
  console.log(req.body);

  var update = {
    active_flag: true,
    application_metadata: util.encodeBase64(JSON.stringify(req.body)),
  };

  // This will update the metadata of a business card
  client.updateTarget(req.params.id, update, function (error, result) {
    if (error) {
      console.error(result);
    } else {
      console.log(result);
    }
  });
  return res.status(200).json({
    status: "success",
    message: "Marker successfully updated",
  });
};
