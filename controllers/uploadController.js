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

const applyHistogramEqualization = async (filePath) => {
  try {
    const image = await Jimp.read(filePath);

    // Access the raw pixel data
    const pixels = image.bitmap.data; // RGBA array

    // Convert to grayscale manually
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      pixels[i] = gray;
      pixels[i + 1] = gray;
      pixels[i + 2] = gray;
    }

    // Step 1: Compute Histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < pixels.length; i += 4) {
      histogram[pixels[i]]++;
    }

    // Step 2: Compute Cumulative Distribution Function (CDF)
    const cdf = [];
    histogram.reduce((acc, value, index) => {
      cdf[index] = acc + value;
      return cdf[index];
    }, 0);

    const cdfMin = cdf.find((value) => value > 0);
    const cdfMax = cdf[255];
    const normalizedCdf = cdf.map((value) =>
      Math.round(((value - cdfMin) / (cdfMax - cdfMin)) * 255)
    );

    // Step 3: Apply Equalization
    for (let i = 0; i < pixels.length; i += 4) {
      const equalizedValue = normalizedCdf[pixels[i]];
      pixels[i] = equalizedValue;
      pixels[i + 1] = equalizedValue;
      pixels[i + 2] = equalizedValue;
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
  histogramName = await applyHistogramEqualization(req.file.path);

  try {
    const target = {
      name: req.body.name,
      width: parseFloat(req.body.width),
      image: util.encodeFileBase64(
        `${__dirname}/../uploads/markers/${histogramName}`
      ),
      active_flag: req.body.active_flag === "true",
      application_metadata: util.encodeBase64(req.body.application_metadata),
    };

    client.addTarget(target, function (error, result) {
      if (error) {
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
