const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
      return next(); // Proceed if authenticated
  } else {
      res.redirect('/login'); // Redirect to login if not authenticated
  }
};

const ensureAdmin = (req, res, next) => {
  console.log("CURRENT SESSION: ", req.session);
  if (req.session.admin) {
      return next(); // Proceed if authenticated
  } else {
      if(ensureAuthenticated){
        res.redirect('/home');
      }else{
        res.redirect('/login'); // Redirect to login if not authenticated
      }
  }
};

module.exports = ensureAuthenticated;
module.exports.ensureAdmin = ensureAdmin;
  