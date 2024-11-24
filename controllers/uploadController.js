const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");

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

exports.uploadCard = async (req, res) => {
  try {
    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { filename, path: filePath } = req.file;
    console.log(req.file);
    // Read and encode the image file
    const imageData = fs.readFileSync(filePath);
    const imageBase64 = imageData.toString("base64");

    // Vuforia credentials
    const accessKey = "5167af135bcd3dce0bebfabdf902b683e58e3c5a"; // Replace with your access key
    const secretKey = "656d5c32f02cad981f813095fc86e216944234b6"; // Replace with your secret key

    // API endpoint
    const vuforiaUrl = "https://vws.vuforia.com/targets";

    // Prepare the payload
    const payload = JSON.stringify({
      name: filename,
      width: 6.0, // Default width
      image: imageBase64,
      application_metadata:"496fbb6532b3863460a984de1d980bed5ebcd507"
    });

    console.log("Payload:", payload); // Debugging the payload content

    // Compute Content-MD5
    const contentMD5 = crypto
      .createHash("md5")
      .update(payload)
      .digest("base64");

    console.log("Content-MD5:", contentMD5); // Debugging the MD5 hash

    // Prepare headers
    const contentType = "application/json";
    const date = new Date().toUTCString(); // Use RFC 2616 format
    const requestPath = "/targets";

    // Construct the StringToSign
    const stringToSign = `POST\n${contentMD5}\n${contentType}\n${date}\n${requestPath}`;
    
    console.log("StringToSign:", stringToSign); // Debugging the StringToSign

    // Generate the signature
    const signature = crypto
      .createHmac("sha1", secretKey)
      .update(stringToSign)
      .digest("base64");

    console.log("Signature:", signature); // Debugging the signature

    // Authorization header
    const headers = {
      "Content-Type": contentType,
      Date: date,
      Authorization: `VWS ${accessKey}:${signature}`,
    };

    console.log("Headers:", headers); // Debugging the request headers

    // Send POST request to Vuforia
    const response = await axios.post(vuforiaUrl, payload, { headers });

    console.log("Vuforia Response:", response.data); // Debugging the Vuforia response

    // Cleanup the uploaded file
    fs.unlinkSync(filePath);

    // Respond to the client    
    res.status(200).json({
      status: "success",
      message: "Marker uploaded successfully!",
      vuforiaResponse: response.data,
    });
  } catch (error) {
    console.error("Error uploading marker to Vuforia:", error.message);
    console.error("Error Details:", error.response?.data || error); // Log detailed error response

    // Send error response
    res.status(500).json({
      status: "error",
      message: "Failed to upload marker to Vuforia.",
      error: error.message,
      details: error.response?.data || null, // Include error details if available
    });
  }
};

