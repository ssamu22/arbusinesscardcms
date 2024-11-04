const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
      return next(); // Proceed if authenticated
  } else {
      res.redirect('/login'); // Redirect to login if not authenticated
  }
};

const ensureAdmin = (req, res, next) => {
  if (req.session.admin) {
      return next(); // Proceed if authenticated
  } else {
      if(ensureAuthenticated){
        return res.status(403).json({ error: 'Unauthorized access' });
      }else{
        res.redirect('/login'); // Redirect to login if not authenticated
      }
  }
};

module.exports = ensureAuthenticated;
module.exports.ensureAdmin = ensureAdmin;
  