const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * File upload utilities using multer
 */

// Define allowed file types and size limits
const FILE_TYPES = {
  document: ['.pdf', '.doc', '.docx', '.txt'],
  image: ['.jpg', '.jpeg', '.png', '.gif'],
  transcript: ['.pdf']
};

const MAX_FILE_SIZE = {
  document: 5 * 1024 * 1024, // 5MB
  image: 2 * 1024 * 1024,    // 2MB
  transcript: 10 * 1024 * 1024 // 10MB
};

// Create uploads directory if it doesn't exist
const UPLOAD_PATH = path.join(__dirname, '..', 'uploads');
const TEMP_PATH = path.join(UPLOAD_PATH, 'temp');

if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

if (!fs.existsSync(TEMP_PATH)) {
  fs.mkdirSync(TEMP_PATH, { recursive: true });
}

// Configure storage destination
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Store temporarily in temp folder
    cb(null, TEMP_PATH);
  },
  filename: function(req, file, cb) {
    // Generate unique filename
    const uniqueName = `${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (fileTypes) => {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (fileTypes && fileTypes.includes(ext)) {
      // Accept file
      cb(null, true);
    } else {
      // Reject file
      cb(new Error(`Invalid file type. Allowed types: ${fileTypes.join(', ')}`), false);
    }
  };
};

/**
 * Create multer upload middleware for specific file types
 * @param {String} fileType - Type of file (document, image, transcript)
 * @returns {Function} - Multer middleware
 */
exports.uploadFile = (fileType = 'document') => {
  const allowedTypes = FILE_TYPES[fileType] || FILE_TYPES.document;
  const maxSize = MAX_FILE_SIZE[fileType] || MAX_FILE_SIZE.document;
  
  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: fileFilter(allowedTypes)
  });
};

/**
 * Move file from temp folder to permanent location
 * @param {String} fileName - Temp file name
 * @param {String} destFolder - Destination folder (relative to uploads)
 * @returns {String} - New file path
 */
exports.moveUploadedFile = (fileName, destFolder = '') => {
  // Create destination folder if it doesn't exist
  const destPath = path.join(UPLOAD_PATH, destFolder);
  
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }
  
  // Source and destination file paths
  const sourcePath = path.join(TEMP_PATH, fileName);
  const destFilePath = path.join(destPath, fileName);
  
  // Move file
  fs.renameSync(sourcePath, destFilePath);
  
  // Return relative path from uploads folder
  return path.join(destFolder, fileName);
};

/**
 * Delete uploaded file
 * @param {String} filePath - File path relative to uploads folder
 * @returns {Boolean} - True if file was deleted
 */
exports.deleteFile = (filePath) => {
  if (!filePath) return false;
  
  const fullPath = path.join(UPLOAD_PATH, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
};

/**
 * Get public URL for a file
 * @param {String} filePath - File path relative to uploads folder
 * @returns {String} - Public URL for the file
 */
exports.getFileUrl = (filePath) => {
  if (!filePath) return '';
  
  // This assumes your API serves uploads at /uploads/*
  return `/uploads/${filePath}`;
}; 