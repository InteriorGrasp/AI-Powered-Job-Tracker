
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view this page');
    res.redirect('/auth/login');
  }
  
  module.exports = { ensureAuthenticated };
  