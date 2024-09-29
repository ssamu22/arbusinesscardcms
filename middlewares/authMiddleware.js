function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
      return next(); // User is authenticated, proceed to the next middleware
    } else {
      return res.redirect('/'); // User is not authenticated, redirect to login page
    }
  }
  
  module.exports = ensureAuthenticated;
  