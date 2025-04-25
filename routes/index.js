var express = require('express');
var router = express.Router();

// Home Page
router.get('/', (req, res) => {
  res.render('index', { title: 'AI-Powered Job Tracker' });
});

// Dashboard Page
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('dashboard', { user: req.user });
});

module.exports = router;
