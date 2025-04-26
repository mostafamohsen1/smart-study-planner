const passport = require('passport');

/**
 * Middleware to authenticate JWT token
 * Use this to protect routes that require authentication
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid or expired token'
      });
    }
    
    // Set user info to request object
    req.user = user;
    return next();
  })(req, res, next);
};

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress;
};

/**
 * Create a middleware that handles errors
 * @param {Function} fn - Async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  authenticate,
  getClientIp,
  asyncHandler
}; 