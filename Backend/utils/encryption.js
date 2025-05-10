// backend/utils/encryption.js
const crypto = require('crypto');

/**
 * Encryption and decryption utilities for sensitive data
 * Uses AES-256-CBC for encryption
 */

// Get encryption key and initialization vector from environment variables
// or generate a default for development (not secure for production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
  crypto.randomBytes(32).toString('hex').slice(0, 32);  // 32 bytes (256 bits)
const IV_LENGTH = 16; // 16 bytes (128 bits) for AES

/**
 * Encrypt a string or object
 * @param {String|Object} data - Data to encrypt
 * @returns {String} - Encrypted data as base64 string
 */
exports.encrypt = (data) => {
  if (!data) return null;
  
  try {
    // Convert object to string if needed
    const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher with key and iv
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Prepend IV to encrypted data for later decryption
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt an encrypted string
 * @param {String} encryptedData - Encrypted data as base64 string
 * @returns {String|Object} - Decrypted data
 */
exports.decrypt = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    // Split IV and encrypted data
    const textParts = encryptedData.split(':');
    
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = textParts[1];
    
    // Create decipher with key and iv
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Try to parse as JSON if it looks like an object
    if (decrypted.startsWith('{') || decrypted.startsWith('[')) {
      try {
        return JSON.parse(decrypted);
      } catch (e) {
        // If parsing fails, return as string
        return decrypted;
      }
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Hash a string using SHA-256
 * @param {String} text - Text to hash
 * @returns {String} - Hashed text
 */
exports.hash = (text) => {
  if (!text) return null;
  
  try {
    return crypto
      .createHash('sha256')
      .update(String(text))
      .digest('hex');
  } catch (error) {
    console.error('Hashing error:', error);
    return null;
  }
};

/**
 * Generate a secure random token
 * @param {Number} bytes - Number of bytes for the token
 * @returns {String} - Random token as hex string
 */
exports.generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};