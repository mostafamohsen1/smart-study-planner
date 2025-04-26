const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { poolPromise, sql } = require('../config/db');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with ID and email
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.UserID,
    email: user.Email
  };
  
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

/**
 * Generate a refresh token
 * @param {Object} user - User object with ID
 * @param {string} ip - Client IP address
 * @returns {Promise<string>} - Refresh token
 */
const generateRefreshToken = async (user, ip) => {
  // Create a refresh token that expires in 7 days
  const token = require('crypto').randomBytes(40).toString('hex');
  const expires = new Date(Date.now() + jwtConfig.refreshTokenExpiration);
  
  // Save token to database
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('UserID', sql.Int, user.UserID)
      .input('RefreshToken', sql.NVarChar, token)
      .input('Expires', sql.DateTime, expires)
      .input('CreatedByIp', sql.NVarChar, ip)
      .execute('sp_SaveRefreshToken');
      
    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
};

/**
 * Verify a refresh token
 * @param {string} token - Refresh token
 * @returns {Promise<Object|null>} - User object or null if invalid
 */
const verifyRefreshToken = async (token) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('RefreshToken', sql.NVarChar, token)
      .execute('sp_VerifyRefreshToken');
      
    const tokenData = result.recordset[0];
    
    if (!tokenData || !tokenData.IsActive) {
      return null;
    }
    
    return {
      id: tokenData.UserID,
      email: tokenData.Email,
      firstName: tokenData.FirstName,
      lastName: tokenData.LastName
    };
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    return null;
  }
};

/**
 * Revoke a refresh token
 * @param {string} token - Refresh token
 * @param {string} ip - Client IP address
 * @param {string} replacementToken - New refresh token that replaces this one
 * @returns {Promise<boolean>} - True if successful
 */
const revokeRefreshToken = async (token, ip, replacementToken = null) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('RefreshToken', sql.NVarChar, token)
      .input('RevokedByIp', sql.NVarChar, ip)
      .input('ReplacedByToken', sql.NVarChar, replacementToken)
      .execute('sp_RevokeRefreshToken');
      
    return result.recordset[0].Success === 1;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
};

/**
 * Log a login attempt
 * @param {string} email - User email
 * @param {string} ip - Client IP address
 * @param {string} userAgent - User agent string
 * @param {boolean} successful - Whether the login was successful
 */
const logLoginAttempt = async (email, ip, userAgent, successful) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Email', sql.NVarChar, email)
      .input('IP', sql.NVarChar, ip)
      .input('UserAgent', sql.NVarChar, userAgent)
      .input('Successful', sql.Bit, successful ? 1 : 0)
      .execute('sp_LogLoginAttempt');
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  logLoginAttempt
}; 