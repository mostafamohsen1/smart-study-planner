const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  expiresIn: process.env.JWT_EXPIRATION || '24h',
  refreshTokenExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    sameSite: 'strict'
  }
}; 