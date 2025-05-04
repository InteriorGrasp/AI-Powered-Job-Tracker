const JobApplication = require('../models/jobApplication');

// Show all applications for the logged-in user
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ user: req.user._id }).sort({ applicationDate: -1 });
    res.render('applications/index', { applications });
  } catch (err) {
    console.error('❌ Error fetching applications:', err);
    req.flash('error_msg', 'Unable to load applications.');
    res.redirect('/');
  }
};

// Render form to add a new job application
exports.renderNewForm = (req, res) => {
  const statuses = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Accepted'];  // Define statuses
  res.render('applications/new', { statuses });
};

// Create a new job application
exports.createApplication = async (req, res) => {
  const { jobTitle, company, location, applicationDate, status, jobLink, resumeVersion } = req.body;

  // Basic validation
  if (!jobTitle || !company) {
    req.flash('error_msg', 'Job title and company are required.');
    return res.redirect('/applications/new');
  }

  try {
    await JobApplication.create({
      user: req.user._id,
      jobTitle,
      company,
      location,
      applicationDate,
      status,
      jobLink,
      resumeVersion
    });

    req.flash('success_msg', 'Job application added!');
    res.redirect('/applications');
  } catch (err) {
    console.error('❌ Error creating application:', err);
    req.flash('error_msg', 'Failed to add application.');
    res.redirect('/applications/new');
  }
};

// Render form to edit an existing application
exports.renderEditForm = async (req, res) => {
  const statuses = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Accepted'];  // Define statuses

  try {
    const application = await JobApplication.findOne({ _id: req.params.id, user: req.user._id });

    if (!application) {
      req.flash('error_msg', 'Application not found.');
      return res.redirect('/applications');
    }

    res.render('applications/edit', { application, statuses });
  } catch (err) {
    console.error(`❌ Error loading edit form for application ${req.params.id}:`, err);
    req.flash('error_msg', 'Error loading edit form.');
    res.redirect('/applications');
  }
};

// Update an existing job application
exports.updateApplication = async (req, res) => {
  const { jobTitle, company, location, applicationDate, status, jobLink, resumeVersion } = req.body;

  // Validation for update (you can add more checks here)
  if (!jobTitle || !company) {
    req.flash('error_msg', 'Job title and company are required.');
    return res.redirect(`/applications/${req.params.id}/edit`);
  }

  try {
    const updated = await JobApplication.findByIdAndUpdate(
      req.params.id, // Using findByIdAndUpdate for clarity
      { jobTitle, company, location, applicationDate, status, jobLink, resumeVersion },
      { new: true } // Returns the updated document
    );

    if (!updated) {
      req.flash('error_msg', 'Application not found.');
      return res.redirect('/applications');
    }

    req.flash('success_msg', 'Application updated.');
    res.redirect('/applications');
  } catch (err) {
    console.error(`❌ Error updating application ${req.params.id}:`, err);
    req.flash('error_msg', 'Failed to update application.');
    res.redirect(`/applications/${req.params.id}/edit`);
  }
};

// Delete a job application
exports.deleteApplication = async (req, res) => {
  try {
    const result = await JobApplication.deleteOne({ _id: req.params.id, user: req.user._id });

    if (result.deletedCount === 0) {
      req.flash('error_msg', 'Application not found or not authorized.');
    } else {
      req.flash('success_msg', 'Application deleted.');
    }

    res.redirect('/applications');
  } catch (err) {
    console.error(`❌ Error deleting application ${req.params.id}:`, err);
    req.flash('error_msg', 'Failed to delete application.');
    res.redirect('/applications');
  }
};
