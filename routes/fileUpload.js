const multer = require('multer');
const path = require('path');

// Set up file storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    // Generating unique file name using timestamp
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

// Initialize multer with the storage configuration and file size limit (e.g., 10MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
}).single('resume'); // 'resume' is the name of the field in your form

// Middleware for handling file uploads
const fileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      req.flash('error_msg', 'File upload failed: ' + err.message);
      return res.redirect('/dashboard'); // Or wherever you want to redirect
    }
    next(); // Proceed to the next middleware or route
  });
};

module.exports = fileUpload;
