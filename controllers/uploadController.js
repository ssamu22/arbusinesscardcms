const multer = require('multer');
const upload = multer({ dest: 'uploads/' }).single('file');

exports.uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'File upload failed', error: err });
    }
    console.log(req.file);  // Use the file to upload it to storage (e.g., Firebase, AWS)
    res.json({ message: 'File uploaded successfully', file: req.file });
  });
};
