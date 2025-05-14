/**
 * Script to set up localtunnel for testing MongoDB Atlas triggers
 * This creates a public URL that forwards to your local server
 */

const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');
const triggerTemplates = require('./trigger-templates');

// Set port to match your Express server
const port = process.env.PORT || 5000;

// Function to update MongoDB trigger functions with new localtunnel URL
const outputTriggerFunctions = (url) => {
  try {
    // Get all trigger functions from templates
    const applicationSubmitted = triggerTemplates.applicationSubmittedTrigger(url);
    const applicationStatusUpdate = triggerTemplates.applicationStatusUpdateTrigger(url);
    const scholarshipCreated = triggerTemplates.scholarshipCreatedTrigger(url);
    const scholarshipStatusUpdate = triggerTemplates.scholarshipStatusUpdateTrigger(url);
    
    // Output Application Submitted Trigger
    console.log(`
===========================================================
1. APPLICATION SUBMITTED TRIGGER (applications collection)
===========================================================

${applicationSubmitted}

===========================================================`);

    // Output Application Status Update Trigger
    console.log(`
===========================================================
2. APPLICATION STATUS UPDATE TRIGGER (applications collection)
===========================================================

${applicationStatusUpdate}

===========================================================`);

    // Output Scholarship Created Trigger
    console.log(`
===========================================================
3. SCHOLARSHIP CREATED TRIGGER (scholarships collection)
===========================================================

${scholarshipCreated}

===========================================================`);

    // Output Scholarship Status Update Trigger
    console.log(`
===========================================================
4. SCHOLARSHIP STATUS UPDATE TRIGGER (scholarships collection)
===========================================================

${scholarshipStatusUpdate}

===========================================================
COPY AND PASTE THE ABOVE FUNCTIONS INTO YOUR MONGODB ATLAS TRIGGERS
===========================================================
`);

    // Save the URL to a file for reference
    const configFile = path.join(__dirname, 'localtunnel-url.txt');
    fs.writeFileSync(configFile, url);
    console.log(`Localtunnel URL saved to: ${configFile}`);
  } catch (error) {
    console.error('Error updating trigger functions:', error);
  }
};

// Set up localtunnel
async function startTunnel() {
  try {
    console.log(`Starting localtunnel for port ${port}...`);
    
    const tunnel = await localtunnel({ port });
    
    console.log(`
✅ Localtunnel started successfully!
🌐 Your public URL is: ${tunnel.url}

✨ Testing the webhook endpoint...
`);
    
    // Test the webhook endpoint
    const axios = require('axios');
    try {
      const response = await axios.get(`${tunnel.url}/api/triggers/test`);
      console.log(`🔍 Test response: ${JSON.stringify(response.data)}`);
      console.log('✅ Webhook endpoint test successful!');
    } catch (error) {
      console.error('❌ Webhook endpoint test failed:', error.message);
      console.log(`
⚠️ Make sure your backend server is running on port ${port}!
`);
    }
    
    // Output the MongoDB trigger functions
    outputTriggerFunctions(tunnel.url);
    
    tunnel.on('close', () => {
      console.log('Localtunnel closed');
    });
    
    console.log(`
🔔 Press Ctrl+C to close the tunnel.
`);
    
  } catch (error) {
    console.error('Error setting up localtunnel:', error);
  }
}

startTunnel(); 