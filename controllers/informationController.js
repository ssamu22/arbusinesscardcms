const path = require('path');
const supabase = require('../utils/supabaseClient');
const Employee = require('../models/Employee');
const Image = require('../models/Image');

exports.getDetails = async (req, res) => {
    const employee_id = req.session.user.employee_id; // Get the user ID from the session
    try {
        const userInfo = await Employee.getOverviewData(employee_id); // Fetch user info from the database
        const image = userInfo.image_id ? await Image.getImageById(userInfo.image_id) : null;
        res.json({ 
            introduction: userInfo.introduction,
            position: userInfo.position,
            fields: userInfo.field,
            image_url: image ? image.image_url : null,
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.uploadProfilePic = async (req, res) => {
    try {
        const file = req.file; // Provided by multer middleware
        const { bucket } = req.body;
        let { fileName } = req.body;
        const employee_id = req.session.user.employee_id;
        const last_name = req.session.user.last_name;

        if (!file || !bucket || !fileName) {
            return res.status(400).json({ error: 'Missing required parameters (file, bucket, fileName).' });
        }

        fileName = employee_id + '_' + last_name + '_' + fileName;

        console.log(bucket);

        // Use the Image model to handle upload and creation
        const uploadedImage = await Image.uploadImage(file, bucket, fileName);
        
        console.log(JSON.stringify(uploadedImage));

        // Return the Image object as the response
        res.json(uploadedImage);
    } catch (error) {
        console.error('Error in uploadImage:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};
