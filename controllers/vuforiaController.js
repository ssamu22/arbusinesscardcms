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

  const { data, error: targetError } = await supabase
    .from("image_target")
    .select("*");

  const targets = await Promise.all(
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

  return res.status(200).json({
    status: "success",
    message: "Successfully retrieved all business cards",
    targets,
  });
};

// This will get the data of the target from the Vuforia
exports.getCard = async (req, res) => {
  client.retrieveTarget(req.params.id, async function (error, result) {
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
      name: req.body.name,
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

exports.deleteCard = async (req, res) => {
  client.deleteTarget(req.params.id, async function (error, result) {
    // Check if the business card in vuforia is successfully deleted
    if (error) {
      return res.status(400).json({
        status: "failed",
        message: "Failed to delete business card target! Please try again.",
      });
    }

    // Delete the business card target from the supabase table
    const { error: dbError } = await supabase
      .from("image_target")
      .delete()
      .eq("image_target", req.params.id);

    if (dbError) {
      return res.status(400).json({
        status: "failed",
        message: "Failed to delete business card target! Please try again.",
      });
    }
  });

  // Return response
  return res.status(203).json({
    status: "success",
    message: "Marker successfully deleted",
  });
};

exports.updateCard = async (req, res) => {
  // Create an update object
  /* 
Accepted values for updating:
1. name
2. width
3. image
4. active_flag
5. application_metadata 
*/
  var update = {
    ...req.body,
  };

  // Removes the bucket from the update object
  delete update.bucket;

  // Converts the width into integer
  if (req.body.width) {
    update.width = parseInt(req.body.width);
  }

  if (req.body.active_flag) {
    update.active_flag = req.body.active_flag === "true";
  }
  // Check if the user will update the image of the target
  if (req.file) {
    update.image = util.encodeFileBase64(
      `${__dirname}/../uploads/markers/${req.file.originalname}`
    );
  }

  // Check if the user will update the metadata of the target
  if (req.body.application_metadata) {
    update.application_metadata = util.encodeBase64(
      req.body.application_metadata
    );
  }

  // This will update the metadata of a business card
  client.updateTarget(req.params.id, update, async function (error, result) {
    console.log(update);
    console.log(req.params.id);
    if (error) {
      return res.status(400).json({
        status: "failed",
        message:
          "Failed to update the business card target in Vuforia! Please try again.",
        error: result,
      });
    }

    let theImage = null;
    if (req.file) {
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
      theImage = await Image.getImageById(uploadedImage.image_id);
      console.log("THE IMAGE:", theImage);

      if (!theImage) {
        return res.status(400).json({
          status: "failed",
          message: "Image cannot be found!",
        });
      }

      const { data, error: dbError } = await supabase
        .from("image_target")
        .update({
          image_id: uploadedImage.image_id,
        })
        .eq("image_target", req.params.id);

      if (dbError) {
        return res.status(400).json({
          status: "failed",
          message:
            "Failed to update the business card target! Please try again.",
        });
      }
    }

    if (req.body.name) {
      const { data, error: dbError } = await supabase
        .from("image_target")
        .update({
          name: req.body.name,
        })
        .eq("image_target", req.params.id);

      if (dbError) {
        return res.status(400).json({
          status: "failed",
          message:
            "Failed to update the business card target! Please try again.",
        });
      }
    }
    res.status(200).json({
      status: "success",
      message: "Marker successfully updated",
      result,
      ...(theImage && { image_url: theImage.image_url }),
    });
  });
};
