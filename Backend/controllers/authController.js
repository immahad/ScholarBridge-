// backend/controllers/authController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const Admin = require('../models/Admin');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const { generateToken, verifyToken } = require('../utils/auth');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { createUserWithProfile } = require('../database/transactions/userTransactions');
const { sendVerificationEmail, sendRegistrationSuccessEmail } = require('../services/emailService');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
// Modified register function in authController.js
exports.register = asyncHandler(async (req, res) => {
  console.log('===== DEBUG REGISTRATION =====');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('dateOfBirth type:', typeof req.body.dateOfBirth);
  console.log('dateOfBirth value:', req.body.dateOfBirth);
  console.log('gender value:', req.body.gender);
  console.log('cnic value:', req.body.cnic);
  console.log('institution value:', req.body.institution);
  console.log('program value:', req.body.program);
  console.log('currentYear value:', req.body.currentYear);
  console.log('expectedGraduationYear value:', req.body.expectedGraduationYear);
  console.log('===== END DEBUG =====');

  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    role, 
    phoneNumber,
    // Additional fields
    dateOfBirth,
    gender,
    cnic,
    institution,
    program,
    currentYear,
    expectedGraduationYear,
    donorType,
    organizationName,
    // Special flag for skipping verification
    skipVerification
  } = req.body;
    // Check if email is already in use with the same role
  const userRole = role || 'student'; // Default to student if not specified
  const existingUser = await User.findOne({ email, role: userRole });
  
  if (existingUser) {
    // Block registration if the email is already registered (regardless of role)
    throw createError('This email is already registered for this role. Please log in or use a different email/role.', 400);
  }

  // Create base user with shared fields
  const baseUserData = {
    email,
    password,
    firstName,
    lastName,
    role: userRole,
    phoneNumber,
    isActive: true,
    // If skipVerification is true, the user is verified immediately
    isVerified: skipVerification === true
  };
  
  let user;
    // Create user based on role (using discriminator pattern)
  try {
    const userRole = role || 'student'; // Default to student if not specified
    
    // Prepare profile-specific data
    let profileData = {};
    
    switch (userRole) {
      case 'student': {
        // Check if CNIC is already in use (for student role only)
        if (cnic) {
          const existingCNIC = await Student.findOne({ cnic });
          if (existingCNIC) {
            throw createError('This CNIC is already registered with another account', 400);
          }
        }

        // Check if required student fields are present
        if (!dateOfBirth) {
          throw createError('Date of birth is required', 400);
        }

        // Prepare student profile data
        profileData = {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          cnic,
          institution,
          program,
          currentYear: currentYear ? Number(currentYear) : undefined,
          expectedGraduationYear: expectedGraduationYear ? Number(expectedGraduationYear) : undefined
        };
        break;
      }
        
      case 'donor': {
        // Prepare donor profile data
        profileData = {
          donorType: donorType || 'individual',
          organizationName
        };
        break;
      }
        
      default:
        throw createError('Invalid role specified', 400);
    }    // Log the data for debugging
    const baseUserDataSafe = { ...baseUserData };
    baseUserDataSafe.password = '[REDACTED]';
    console.log('Creating user with data:', JSON.stringify({
      baseUserData: baseUserDataSafe,
      profileData
    }, null, 2));
    
    // Import the function directly to avoid module caching issues
    const userTransactions = require('../database/transactions/userTransactions');
    
    // Use transaction to create user with profile
    user = await userTransactions.createUserWithProfile(baseUserData, profileData);
    console.log('User created:', user);
  } catch (error) {
    // Enhanced error handling for validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error);
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: validationErrors[0] || 'Validation failed',
        errors: validationErrors
      });
    }
    
    // If it's already a formatted error from createError, throw it
    if (error.statusCode) {
      throw error;
    }
    
    // For unexpected errors
    console.error('Error creating user:', error);
    throw createError('Error creating user: ' + (error.message || 'Unknown error'), 500);
  }
  
  // If skipping verification, send success email, otherwise send verification email with token
  if (skipVerification === true) {
    console.log('Skipping verification for user:', user.email);
    // Ensure user is marked as verified
    user.isVerified = true;
    // No need for verification token
    user.verificationToken = undefined;
    await user.save();
    
    // Send registration success email
    try {
      const emailService = require('../services/emailService');
      await emailService.sendRegistrationSuccessEmail(user);
      console.log('Registration success email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send registration success email:', emailError);
    }
  } else {
    // Generate verification token
    console.log('Setting up verification for user:', user.email);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.isVerified = false; // Explicitly set to false
    await user.save();
    
    // Send verification email
    try {
      await sendVerificationEmail(user);
      console.log('Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }
  }
  
  // Generate JWT token
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  
  // Remove sensitive data from response
  const userWithoutPassword = { ...user.toObject() };
  delete userWithoutPassword.password;
  delete userWithoutPassword.verificationToken;
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: userWithoutPassword,
    token,
    refreshToken,
    isVerified: user.isVerified
  });
});

/**
 * Log in a user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = asyncHandler(async (req, res) => {
  console.log('Full request body:', JSON.stringify(req.body));
  
  // Extract credentials from request body
  const { email, password } = req.body;
  // Try to get role from various places in the request
  const role = req.body.role || req.query.role || 'student';
  
  console.log(`Login attempt for email: ${email} with role: ${role}`);
  
  // Debug: Check for any users with this email
  const allUsersWithEmail = await User.find({ email });
  console.log(`Found ${allUsersWithEmail.length} users with email ${email}:`);
  allUsersWithEmail.forEach(u => console.log(`- User ID: ${u._id}, Role: ${u.role}, Verified: ${u.isVerified}`));
  
  // Special case: if multiple roles exist for this email and we're defaulting to student,
  // check if the student role exists, otherwise use the first role found
  let user;
  
  if (role === 'student' && allUsersWithEmail.length > 0) {
    user = await User.findOne({ email, role }).select('+password +loginAttempts +lockedUntil');
    
    // If no student account found but other accounts exist, use the first one
    if (!user && allUsersWithEmail.length > 0) {
      const firstUserRole = allUsersWithEmail[0].role;
      console.log(`No student account found, trying role: ${firstUserRole}`);
      user = await User.findOne({ email, role: firstUserRole }).select('+password +loginAttempts +lockedUntil');
    }
  } else {
    // Standard case: look for the specific role
    user = await User.findOne({ email, role }).select('+password +loginAttempts +lockedUntil');
  }
  
  // Check if user exists
  if (!user) {
    console.log(`User not found with email: ${email} and role: ${role}`);
    throw createError('Invalid credentials', 401);
  }
  
  console.log(`Found user with ID: ${user._id}, Role: ${user.role}`);
  
  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingTime = Math.ceil((user.lockedUntil - new Date()) / (1000 * 60));
    throw createError(`Account is locked. Please try again in ${remainingTime} minutes.`, 423);
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw createError('Your account has been deactivated', 401);
  }
  
  // Check if password matches
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    // Increment login attempts and possibly lock account
    await User.incrementLoginAttempts(email);
    
    // If this was the 5th attempt, account is now locked
    if (user.loginAttempts >= 4) {
      throw createError('Too many failed login attempts. Account is locked for 15 minutes.', 423);
    }
    
    throw createError('Invalid credentials', 401);
  }
  
  // Reset login attempts on successful login
  await User.resetLoginAttempts(user._id);
  
  // If user is admin, log activity
  if (user.role === 'admin') {
    const admin = await Admin.findOne({ _id: user._id });
    
    if (admin) {
      await admin.logActivity('login', {}, req);
    }
  }
  
  // Generate JWT token
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  
  // Remove sensitive data from response
  const userWithoutPassword = { ...user.toObject() };
  delete userWithoutPassword.password;
  delete userWithoutPassword.verificationToken;
  delete userWithoutPassword.loginAttempts;
  delete userWithoutPassword.lockedUntil;
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: userWithoutPassword,
    token,
    refreshToken
  });
});

/**
 * Admin Login - Specialized endpoint for admin users
 * @route POST /api/auth/admin-login
 * @access Public
 */
exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Admin login attempt for email:', email);
  
  // Find user by email and ensure it's an admin
  const user = await User.findOne({ 
    email, 
    role: 'admin' 
  }).select('+password +loginAttempts +lockedUntil');
  
  // If user doesn't exist or is not an admin
  if (!user) {
    console.log('Admin login failed: User not found or not an admin');
    throw createError('Invalid admin credentials', 401);
  }
  
  // Reset login attempts for easier debugging during development
  if (process.env.NODE_ENV === 'development' && user.loginAttempts > 0) {
    console.log('Development mode: Resetting login attempts for admin');
    await User.updateOne(
      { _id: user._id },
      { $set: { loginAttempts: 0, lockedUntil: null } }
    );
    user.loginAttempts = 0;
    user.lockedUntil = null;
  }
  
  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingTime = Math.ceil((user.lockedUntil - new Date()) / (1000 * 60));
    console.log('Admin login failed: Account is locked until', user.lockedUntil);
    throw createError(`Account is locked. Please try again in ${remainingTime} minutes.`, 423);
  }
  
  // Check if user is active
  if (!user.isActive) {
    console.log('Admin login failed: Account is deactivated');
    throw createError('Your admin account has been deactivated', 401);
  }
  
  // Check if password matches
  const isMatch = await user.matchPassword(password);
  console.log('Password match result:', isMatch);
  
  if (!isMatch) {
    console.log('Admin login failed: Invalid password');
    // Increment login attempts and possibly lock account
    await User.incrementLoginAttempts(email);
    
    // If this was the 5th attempt, account is now locked
    if (user.loginAttempts >= 4) {
      throw createError('Too many failed login attempts. Account is locked for 15 minutes.', 423);
    }
    
    throw createError('Invalid admin credentials', 401);
  }
  
  // Reset login attempts on successful login
  await User.resetLoginAttempts(user._id);
  
  // Ensure we have the Admin model instance
  const admin = await Admin.findOne({ _id: user._id });
  
  if (!admin) {
    throw createError('Admin profile not found', 404);
  }
  
  // Log the admin login activity
  await admin.logActivity('login', { method: 'admin-login' }, req);
  
  // Generate JWT token with admin-specific claims
  const token = jwt.sign(
    { 
      userId: user._id,
      role: 'admin',
      adminLevel: admin.adminLevel,
      tokenVersion: user.tokenVersion
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expire,
      issuer: 'scholarship-management-system',
      audience: 'sms-admins'
    }
  );
  
  const refreshToken = user.generateRefreshToken();
  
  // Remove sensitive data from response
  const userWithoutPassword = { ...admin.toObject() };
  delete userWithoutPassword.password;
  delete userWithoutPassword.verificationToken;
  delete userWithoutPassword.loginAttempts;
  delete userWithoutPassword.lockedUntil;
  
  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    user: userWithoutPassword,
    token,
    refreshToken
  });
});

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw createError('Invalid refresh token', 401);
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw createError('Your account has been deactivated', 401);
    }
    
    // Check if token version matches
    if (user.tokenVersion !== decoded.tokenVersion) {
      throw createError('Refresh token has been invalidated', 401);
    }
    
    // Generate new tokens
    const newAccessToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();
    
    res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createError('Invalid or expired refresh token', 401);
    }
    
    throw error;
  }
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  // User is already attached to req by auth middleware
  const userId = req.user._id;
  
  // Get user by role to get all fields
  let user;
  
  switch (req.user.role) {
    case 'student':
      user = await Student.findById(userId);
      break;
    case 'donor':
      user = await Donor.findById(userId);
      break;
    case 'admin':
      user = await Admin.findById(userId);
      break;
    default:
      user = await User.findById(userId);
  }
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  res.status(200).json({
    success: true,
    user
  });
});

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    // Send success response even if email doesn't exist for security
    return res.status(200).json({
      success: true,
      message: 'Password reset email sent if account exists'
    });
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to user
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  
  await user.save({ validateBeforeSave: false });
  
  // TODO: Send reset email
  
  res.status(200).json({
    success: true,
    message: 'Password reset email sent'
  });
});

/**
 * Reset password
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  // Hash token to compare with stored token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  }).select('+password');
  
  if (!user) {
    throw createError('Invalid or expired reset token', 400);
  }
  
  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  // Increment token version to invalidate existing tokens
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  
  await user.save();
  
  // Generate new tokens
  const newToken = user.generateAuthToken();
  const newRefreshToken = user.generateRefreshToken();
  
  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    token: newToken,
    refreshToken: newRefreshToken
  });
});

/**
 * Verify email address
 * @route GET /api/auth/verify-email/:role/:token
 * @access Public
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { role, token } = req.params;
  console.log('Verification attempt with:', { role, token });
  
  if (!token || !role) {
    console.error('Missing token or role in params');
    throw createError('Invalid verification parameters', 400);
  }
  
  // First attempt: direct match with role and token
  let user = await User.findOne({ verificationToken: token, role });
  console.log('Direct match found:', user ? 'Yes' : 'No');
  
  if (!user) {
    // Try all unverified users with this role to find a match
    const users = await User.find({ role, isVerified: false });
    console.log(`Found ${users.length} unverified users with role ${role}`);
    
    for (const potentialUser of users) {
      console.log('Checking user:', potentialUser.email);
      console.log('User token:', potentialUser.verificationToken);
      console.log('URL token:', token);
      
      if (potentialUser.verificationToken && 
          potentialUser.verificationToken.toLowerCase() === token.toLowerCase()) {
        user = potentialUser;
        console.log('Found match with case-insensitive comparison for', potentialUser.email);
        break;
      }
    }
  }
  
  if (!user) {
    console.error('No user found with token:', token);
    throw createError('Invalid verification token', 400);
  }
  
  // Print all user details for debugging
  console.log('User before verification update:', JSON.stringify(user, null, 2));
  
  // Mark user as verified
  user.isVerified = true;
  user.verificationToken = undefined;
  
  try {
    await user.save();
    console.log('User verified successfully. Updated user:', JSON.stringify(user, null, 2));
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (saveError) {
    console.error('Error saving verified user:', saveError);
    throw createError('Error updating user verification status', 500);
  }
});

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 */
exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // Try to get role from both body and query params
  const role = req.query.role || req.body.role || 'student';
  
  console.log(`Resend verification request for email: ${email}, role: ${role}`);
  
  // Find user by email and role
  const user = await User.findOne({ email, role });
  
  // Even if user not found, don't reveal that info for security
  if (!user || user.isVerified) {
    console.log(`User not found or already verified for email: ${email}, role: ${role}`);
    return res.status(200).json({
      success: true,
      message: 'If your email is registered and not verified, a new verification link has been sent.'
    });
  }
  
  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  await user.save();
  
  // Send verification email
  try {
    await sendVerificationEmail(user);
    console.log('Resent verification email to:', email);
  } catch (emailError) {
    console.error('Failed to resend verification email:', emailError);
    // Still return success to not reveal if the email exists
  }
  
  res.status(200).json({
    success: true,
    message: 'If your email is registered and not verified, a new verification link has been sent.'
  });
});

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = asyncHandler(async (req, res) => {
  // Increment token version to invalidate existing tokens
  const user = await User.findById(req.user._id);
  
  if (user) {
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Change password
 * @route POST /api/auth/change-password
 * @access Private
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Get user with password field
  const user = await User.findById(req.user._id).select('+password');
  
  if (!user) {
    throw createError('User not found', 404);
  }
  
  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  
  if (!isMatch) {
    throw createError('Current password is incorrect', 401);
  }
  
  // Set new password
  user.password = newPassword;
  
  // Increment token version to invalidate existing tokens
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  
  await user.save();
  
  // Generate new tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  
  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    token,
    refreshToken
  });
});

/**
 * Check if admin exists (for admin login flow)
 * @route GET /api/auth/check-admin
 * @access Public
 */
exports.checkAdminExists = asyncHandler(async (req, res) => {
  const { email } = req.query;
  
  // Return success regardless of actual result for security reasons
  let adminExists = false;
  
  if (email) {
    const user = await User.findOne({ email, role: 'admin' });
    adminExists = !!user;
  }
  
  res.status(200).json({
    success: true,
    adminExists
  });
});

/**
 * Validate JWT token and return user data
 * @route GET /api/auth/validate-token
 * @access Private
 */
exports.validateToken = asyncHandler(async (req, res) => {
  // User is already verified by the verifyToken middleware
  // Just return the user data
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid token'
    });
  }

  return res.status(200).json({
    success: true,
    user: req.user
  });
});

/**
 * Direct verification endpoint with token and role as query parameters
 * @route GET /api/auth/direct-verify
 * @access Public
 */
exports.directVerify = asyncHandler(async (req, res) => {
  const { token, role, email } = req.query;
  console.log('Direct verification attempt with:', { role, token, email });
  
  if (!token || !role) {
    console.error('Missing token or role in query params');
    throw createError('Missing token or role', 400);
  }
  
  let user = null;
  
  // If email is provided, try to find the user directly
  if (email) {
    user = await User.findOne({ email, role });
    console.log('User found by email and role:', user ? 'Yes' : 'No');
    
    // Check if token matches
    if (user && user.verificationToken) {
      console.log('Comparing tokens:', {
        'DB token': user.verificationToken,
        'URL token': token,
        'Match': user.verificationToken.toLowerCase() === token.toLowerCase()
      });
    }
  }
  
  // If not found by email or token doesn't match, search all unverified users
  if (!user || user.verificationToken !== token) {
    const users = await User.find({ role, isVerified: false });
    console.log(`Found ${users.length} unverified users with role ${role}`);
    
    for (const potentialUser of users) {
      console.log('Checking user:', potentialUser.email);
      console.log('User token:', potentialUser.verificationToken);
      console.log('URL token:', token);
      
      if (potentialUser.verificationToken && 
          potentialUser.verificationToken.toLowerCase() === token.toLowerCase()) {
        user = potentialUser;
        console.log('Found match with case-insensitive comparison for', potentialUser.email);
        break;
      }
    }
  }
  
  if (!user) {
    console.error('No user found for verification');
    throw createError('Invalid verification token', 400);
  }
  
  // Print user details for debugging
  console.log('User before verification update:', JSON.stringify(user, null, 2));
  
  // Mark user as verified
  user.isVerified = true;
  user.verificationToken = undefined;
  
  try {
    await user.save();
    console.log('User verified successfully. Updated user:', JSON.stringify(user, null, 2));
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      email: user.email
    });
  } catch (saveError) {
    console.error('Error saving verified user:', saveError);
    throw createError('Error updating user verification status', 500);
  }
});

/**
 * One-step verification that handles verification and redirects to success page
 * @route GET /api/auth/verify
 * @access Public
 */
exports.verifyAndRedirect = asyncHandler(async (req, res) => {
  const { token, role, email } = req.query;
  console.log('One-step verification attempt:', { role, token, email });
  
  if (!token || !role) {
    console.error('Missing token or role');
    return res.redirect(`${config.frontendUrl}/verification-failed`);
  }
  
  try {
    // Try to find the user directly by email and role
    let user = null;
    
    if (email) {
      user = await User.findOne({ email, role });
      console.log('Found user by email:', user ? 'Yes' : 'No');
      
      // Verify token matches
      if (user && user.verificationToken) {
        const tokenMatches = user.verificationToken.toLowerCase() === token.toLowerCase();
        console.log('Token match for user:', tokenMatches);
        
        if (!tokenMatches) {
          user = null; // Reset if token doesn't match
        }
      }
    }
    
    // If not found by email and role, try by token
    if (!user) {
      user = await User.findOne({ verificationToken: token, role });
      console.log('Found user by token and role:', user ? 'Yes' : 'No');
    }
    
    // If still not found, try all unverified users with this role
    if (!user) {
      console.log('Direct match not found, trying all unverified users with role');
      const users = await User.find({ role, isVerified: false });
      console.log(`Found ${users.length} unverified users with role ${role}`);
      
      // Try to find the user by case-insensitive token
      for (const potentialUser of users) {
        console.log(`Checking ${potentialUser.email} with token: ${potentialUser.verificationToken}`);
        
        if (potentialUser.verificationToken && 
            potentialUser.verificationToken.toLowerCase() === token.toLowerCase()) {
          user = potentialUser;
          console.log('Found user by case-insensitive token comparison:', user.email);
          break;
        }
      }
    }
    
    if (!user) {
      console.error('No matching user found for verification');
      return res.redirect(`${config.frontendUrl}/verification-failed`);
    }
    
    // CRITICAL: Print user details before making any changes
    console.log('User BEFORE verification update:', JSON.stringify(user, null, 2));
    
    // Force an update directly with an atomic operation
    const updateResult = await User.updateOne(
      { _id: user._id },
      { 
        $set: { isVerified: true },
        $unset: { verificationToken: 1 }
      }
    );
    
    console.log('Update result:', updateResult);
    
    // Fetch the user again to confirm changes were applied
    const updatedUser = await User.findById(user._id);
    console.log('User AFTER verification update:', JSON.stringify(updatedUser, null, 2));
    
    // Redirect to success page on the frontend
    return res.redirect(`${config.frontendUrl}/login?verified=true`);
  } catch (error) {
    console.error('Verification error:', error);
    return res.redirect(`${config.frontendUrl}/verification-failed`);
  }
});