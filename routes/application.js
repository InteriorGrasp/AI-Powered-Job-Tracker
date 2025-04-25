const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { ensureAuthenticated } = require('../middleware/auth');

// Show all applications for logged-in user
router.get('/', ensureAuthenticated, applicationController.getAllApplications);

// Show form to add a new application
router.get('/new', ensureAuthenticated, applicationController.renderNewForm);

// Handle new application form submission
router.post('/', ensureAuthenticated, applicationController.createApplication);

// Show form to edit application
router.get('/:id/edit', ensureAuthenticated, applicationController.renderEditForm);

// Handle edit form submission
router.post('/:id/update', ensureAuthenticated, applicationController.updateApplication);

// Delete an application
router.post('/:id/delete', ensureAuthenticated, applicationController.deleteApplication);

module.exports = router;
