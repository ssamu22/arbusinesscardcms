const axios = require("axios");
const Image = require("../models/Image");
// const crypto = require("crypto");
// const fs = require("fs");
// const { Jimp } = require("jimp");
// const path = require("path");
const supabase = require("../utils/supabaseClient");

var vuforia = require("vuforia-api");

var client = vuforia.client({
  serverAccessKey: process.env.VUFORIA_SERVER_ACCESS_KEY,
  serverSecretKey: process.env.VUFORIA_SERVER_SECRET_KEY,
  clientAccessKey: process.env.VUFORIA_CLIENT_ACCESS_KEY,
  clientSecretKey: process.env.VUFORIA_CLIENT_SECRET_KEY,
});

// util for base64 encoding and decoding
var util = vuforia.util();

exports.getAllCards = async (req, res) => {
  // This will retrieve all the target id's from the Vuforia cloud database
  client.listTargets(async function (error, result) {
    if (error) {
      return res.status(400).json({
        status: "failed",
        message: "failed to retrieve business card targets",
      });
    }

    const { data, error: targetError } = await supabase
      .from("image_target")
      .select("*")
      .in("image_target", [result.results]);

    const updatedData = await Promise.all(
      data.map(async (target) => {
        
        console.log(target);
        console.log("THE TARGET IMAGE:", target.image_id);
        const imageData = await Image.getImageById(target.image_id);

        console.log("THE DATA:", imageData);
        return {
          ...target,
          image_url: imageData.image_url, // Ensure imageData is not undefined
        };
      })
    );

    res.status(200).json({
      status: "success",
      message: "Successfully retrieved a business card",
      updatedData,
    });
  });
};

exports.getCard = (req, res) => {
  client.retrieveTarget(req.params.id, function (error, result) {
    if (error) {
      return res.status(400).json({
        status: "success",
        message: "failed to retrieve business card targets",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Successfully retrieved a business card",
      result,
    });
  });
};

exports.addCard = async (req, res) => {
  var target = {
    name: req.body.name,
    width: parseInt(req.body.width),
    image: util.encodeFileBase64(
      `${__dirname}/../uploads/markers/${req.file.originalname}`
    ),
    active_flag: req.body.active_flag === "true",
    application_metadata: util.encodeBase64(req.body.application_metadata),
  };

  await client.addTarget(target, async function (error, result) {
    if (error) {
      return res.status(400).json({
        status: "failed",
        message: "Failed to add new business card target!",
        result,
      });
    }

    const uploadedImage = await Image.uploadImage(
      req.file,
      req.body.bucket,
      req.file.originalname
    );

    if (!uploadedImage) {
      return res.status(400).json({
        status: "failed",
        message: "Error uploading the image to the database!",
      });
    }

    // Get the image by its id
    const theImage = await Image.getImageById(uploadedImage.image_id);

    if (!theImage) {
      return res.status(400).json({
        status: "failed",
        message: "Image cannot be found!",
      });
    }

    const { error: dbError } = await supabase.from("image_target").insert({
      image_target: result.target_id,
      image_id: uploadedImage.image_id,
    });

    if (dbError) {
      return res.status(400).json({
        status: "failed",
        message: "Failed to store new target in the database",
      });
    }

    res.status(200).json({
      status: "success",
      message: "New business card target successfully added!",
      result,
      theImage,
    });
  });
};

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
