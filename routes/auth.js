const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  // Get file extension
    cb(null, Date.now() + ext);  // Generate a unique filename
  }
});

const upload = multer({ storage: storage });

// User Login Route
router.get('/login', (req, res) => {
  res.render('index');  // Render the Login page
});

// User Registration Route
router.get('/register', (req, res) => {
  res.render('register');  // Render the registration page
});

// POST Route for User Registration
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validate input
  if (!name || !email || !password || !confirmPassword) {
    req.flash('error_msg', 'Please fill in all fields');
    return res.redirect('/auth/register');  
  }
  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match');
    return res.redirect('/auth/register');  
  }
  if (password.length < 6) {
    req.flash('error_msg', 'Password must be at least 6 characters');
    return res.redirect('/auth/register');  
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email is already registered');
      return res.redirect('/auth/register');  // Redirect back to register page if email exists
    }

    // Create a new user object
    const newUser = new User({ 
      name, 
      email, 
      password,  
      provider: 'local',
    });

    // Save the new user
    await newUser.save();

    // Flash success message and redirect to login page
    req.flash('success_msg', 'You are now registered! You can log in.');
    res.redirect('/auth/login');  // Redirect to the login page after registration
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong, try again later.');
    res.redirect('/auth/register');  
  }
});

// POST Route for User Login 
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    // Manually log in the user using Passport
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      res.redirect('/dashboard');
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong, try again later.');
    res.redirect('/auth/login');
  }
});

// Google Login Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

// GitHub Login Route
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

// Logout Route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => { 
      res.redirect('/');
    });
  });
});

// Add a route to handle resume file uploads
router.post('/uploadResume', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    req.flash('error_msg', 'No file uploaded');
    return res.redirect('/dashboard');
  }

  try {
    // Log file details to verify
    console.log('File uploaded: ', req.file);
    
    const user = await User.findById(req.user.id);  // Find the user by ID
    user.resume = req.file.path; // Save the uploaded resume path to the user's profile
    await user.save();

    req.flash('success_msg', 'Resume uploaded successfully!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong while uploading your resume');
    res.redirect('/dashboard');
  }
});

module.exports = router;
