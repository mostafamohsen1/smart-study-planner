const { poolPromise, sql } = require('../config/db');
const { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  logLoginAttempt
} = require('../utils/auth');
const { getClientIp } = require('../middleware/auth');
const validator = require('validator');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email'
      });
    }
    
    // Password validation
    if (!validator.isLength(password, { min: 6 })) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Connect to database
    const pool = await poolPromise;
    
    try {
      // Register user using stored procedure
      const result = await pool.request()
        .input('Email', sql.NVarChar, email)
        .input('Password', sql.NVarChar, hashedPassword)
        .input('FirstName', sql.NVarChar, firstName)
        .input('LastName', sql.NVarChar, lastName)
        .execute('sp_RegisterUser');
      
      const user = result.recordset[0];
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Generate refresh token
      const refreshToken = await generateRefreshToken(user, getClientIp(req));
      
      // Return success with user info and token
      return res.status(201).json({
        success: true,
        user: {
          id: user.UserID,
          email: user.Email,
          firstName: user.FirstName,
          lastName: user.LastName
        },
        token,
        refreshToken
      });
    } catch (error) {
      // Handle duplicate email error
      if (error.number === 50001) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered'
        });
      }
      
      // Handle other database errors
      console.error('Database error during registration:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  } catch (error) {
    console.error('Error in register controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Connect to database
    const pool = await poolPromise;
    
    // Get user from database
    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .execute('sp_AuthenticateUser');
    
    const user = result.recordset[0];
    
    // Check if user exists
    if (!user) {
      // Log failed login attempt
      await logLoginAttempt(email, getClientIp(req), req.headers['user-agent'], false);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await comparePassword(password, user.Password);
    
    if (!isMatch) {
      // Log failed login attempt
      await logLoginAttempt(email, getClientIp(req), req.headers['user-agent'], false);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Log successful login attempt
    await logLoginAttempt(email, getClientIp(req), req.headers['user-agent'], true);
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Generate refresh token
    const refreshToken = await generateRefreshToken(user, getClientIp(req));
    
    // Return success with user info and token
    return res.status(200).json({
      success: true,
      user: {
        id: user.UserID,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Error in login controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = async (req, res) => {
  try {
    // User is already available in req.user from authentication middleware
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.UserID,
        email: req.user.Email,
        firstName: req.user.FirstName,
        lastName: req.user.LastName,
        createdAt: req.user.CreatedAt
      }
    });
  } catch (error) {
    console.error('Error in getProfile controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify the refresh token
    const user = await verifyRefreshToken(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Generate new tokens
    const newAccessToken = generateToken(user);
    const newRefreshToken = await generateRefreshToken(user, getClientIp(req));
    
    // Revoke the old refresh token
    await revokeRefreshToken(token, getClientIp(req), newRefreshToken);
    
    // Return new tokens
    return res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Error in refreshToken controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Logout a user by revoking their refresh token
 * @route POST /api/auth/logout
 * @access Public
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Revoke the refresh token
    const success = await revokeRefreshToken(refreshToken, getClientIp(req));
    
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error in logout controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refreshToken,
  logout
}; 