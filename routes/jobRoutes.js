const express = require('express');
const router = express.Router();
const { fetchJobListings } = require('../controllers/jobController');
const { ensureAuthenticated } = require('../middleware/auth');


// Route to display job listings
router.get('/', ensureAuthenticated, async (req, res) => {
  const searchQuery = req.query.searchQuery || 'software developer';
  const location = req.query.location || 'Toronto';

  try {
    const jobs = await fetchJobListings(searchQuery, location);

    if (jobs) {
      res.render('jobList', { jobs });
    } else {
      res.render('jobList', { message: 'No job listings found.' });
    }
  } catch (error) {
    res.status(500).send('Error fetching job listings');
  }
});

module.exports = router;
