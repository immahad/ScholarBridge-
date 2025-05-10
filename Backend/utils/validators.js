// backend/utils/validators.js
/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateEmail(email) {
    const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result with isValid and message
   */
  function validatePassword(password) {
    if (!password || password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters long'
      };
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter'
      };
    }
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one lowercase letter'
      };
    }
    
    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one number'
      };
    }
    
    return {
      isValid: true,
      message: 'Password is valid'
    };
  }
  
  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  function validatePhone(phone) {
    // Basic validation - adapt to your country format
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  }
  
  /**
   * Validate CNIC format (Pakistan ID)
   * @param {string} cnic - CNIC to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  function validateCNIC(cnic) {
    // Pakistani CNIC format: 12345-1234567-1
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
    return cnicRegex.test(cnic);
  }
  
  module.exports = {
    validateEmail,
    validatePassword,
    validatePhone,
    validateCNIC
  };