const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { ensureAuthenticated } = require('../middleware/auth');

// Define the statuses array globally
const statuses = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Accepted'];

// View all applications
router.get('/', ensureAuthenticated, applicationController.getAllApplications);

// Create new application
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('applications/new', { statuses });
});
router.post('/', ensureAuthenticated, applicationController.createApplication);

// Edit/update application
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  const application = await applicationController.findApplicationById(req.params.id, req.user._id);
  if (!application) {
    req.flash('error_msg', 'Application not found.');
    return res.redirect('/applications');
  }
  res.render('applications/edit', { application, statuses });
});
router.patch('/:id', ensureAuthenticated, applicationController.updateApplication);

// Delete application
router.delete('/:id', ensureAuthenticated, applicationController.deleteApplication);

module.exports = router;
