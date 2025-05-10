// debugMiddleware.js - Add this as a new file in your middleware directory
const debugMiddleware = (req, res, next) => {
    console.log('===== REQUEST DEBUG =====');
    console.log(`${req.method} ${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // Save the original send method
    const originalSend = res.send;
    
    // Override the send method to log the response
    res.send = function(body) {
      console.log('===== RESPONSE DEBUG =====');
      console.log('Status:', res.statusCode);
      console.log('Body:', typeof body === 'string' ? body : JSON.stringify(body, null, 2));
      console.log('===== END DEBUG =====');
      
      // Call the original send method
      return originalSend.call(this, body);
    };
    
    next();
  };
  
  module.exports = debugMiddleware;