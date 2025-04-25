const JobApplication = require('../models/jobApplication');

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

exports.renderNewForm = (req, res) => {
  res.render('applications/new');
};

exports.createApplication = async (req, res) => {
  try {
    const data = req.body;
    await JobApplication.create({ ...data, user: req.user._id });
    req.flash('success_msg', 'Job application added!');
    res.redirect('/applications');
  } catch (err) {
    console.error('❌ Error creating application:', err);
    req.flash('error_msg', 'Failed to add application.');
    res.redirect('/applications/new');
  }
};

exports.renderEditForm = async (req, res) => {
  try {
    const application = await JobApplication.findOne({ _id: req.params.id, user: req.user._id });
    if (!application) {
      req.flash('error_msg', 'Application not found.');
      return res.redirect('/applications');
    }
    res.render('applications/edit', { application });
  } catch (err) {
    console.error('❌ Error loading edit form:', err);
    req.flash('error_msg', 'Error loading edit form.');
    res.redirect('/applications');
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const result = await JobApplication.updateOne(
      { _id: req.params.id, user: req.user._id },
      req.body
    );

    if (result.matchedCount === 0) {
      req.flash('error_msg', 'Application not found.');
    } else if (result.modifiedCount === 0) {
      req.flash('info_msg', 'No changes made.');
    } else {
      req.flash('success_msg', 'Application updated.');
    }

    res.redirect('/applications');
  } catch (err) {
    console.error('❌ Error updating application:', err);
    req.flash('error_msg', 'Failed to update application.');
    res.redirect(`/applications/${req.params.id}/edit`);
  }
};

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
    console.error('❌ Error deleting application:', err);
    req.flash('error_msg', 'Failed to delete application.');
    res.redirect('/applications');
  }
};
