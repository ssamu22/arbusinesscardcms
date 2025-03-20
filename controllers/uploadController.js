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
      width: parseInt(req.body.width),
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
