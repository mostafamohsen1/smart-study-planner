const passport = require('passport');

// Middleware to protect routes
exports.protect = passport.authenticate('jwt', { session: false });

// Check if user has proper role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }
    next();
  };
}; 