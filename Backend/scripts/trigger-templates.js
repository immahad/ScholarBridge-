/**
 * MongoDB Atlas Trigger Templates
 * 
 * This file contains templates for all the required MongoDB Atlas triggers.
 * Replace TUNNEL_URL with your actual localtunnel URL when copying.
 */

// Application Submitted Trigger Function (for applications collection)
exports.applicationSubmittedTrigger = (tunnelUrl) => {
  return `exports = function(changeEvent) {
  const applicationId = changeEvent.documentKey._id;
  const fullDocument = changeEvent.fullDocument;

  // Your localtunnel URL
  const localTunnelUrl = "${tunnelUrl}";

  console.log("Application submitted trigger activated:", applicationId);

  // Send the webhook request to your tunnel
  return context.http.post({
    url: \`\${localTunnelUrl}/api/triggers/application-submitted\`,
    body: {
      applicationId: applicationId, // Do not convert to string to preserve EJSON format
      operationType: "insert",
      fullDocument: fullDocument
    },
    encodeBodyAsJSON: true
  }).then(response => {
    // Log the response for debugging
    console.log("Webhook response status:", response.statusCode);
    console.log("Webhook response body:", response.body.text());
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log("Webhook successfully delivered");
      return { success: true };
    } else {
      console.error("Failed to deliver webhook:", response.body.text());
      return { success: false, error: response.body.text() };
    }
  }).catch(err => {
    console.error("Error sending webhook:", err);
    return { success: false, error: err.toString() };
  });
};`;
};

// Application Status Update Trigger Function (for applications collection)
exports.applicationStatusUpdateTrigger = (tunnelUrl) => {
  return `exports = function(changeEvent) {
  try {
    // Log the entire event for debugging
    console.log("Full change event:", JSON.stringify(changeEvent));
    
    const applicationId = changeEvent.documentKey._id;
    const fullDocument = changeEvent.fullDocument;
    const updateDescription = changeEvent.updateDescription;
    
    // Your localtunnel URL
    const localTunnelUrl = "${tunnelUrl}";
    
    console.log("Application status updated trigger activated with ID:", JSON.stringify(applicationId));
    console.log("Updated fields:", JSON.stringify(updateDescription?.updatedFields));
    
    // Check if status field was updated
    if (!updateDescription?.updatedFields?.status) {
      console.log("Status field was not updated, skipping trigger");
      return { success: false, message: "Status field not updated" };
    }
    
    const newStatus = updateDescription.updatedFields.status;
    console.log("New application status:", newStatus);
    
    // Send the webhook request to your tunnel
    return context.http.post({
      url: \`\${localTunnelUrl}/api/triggers/application-status-updated\`,
      body: {
        applicationId: applicationId, // Do not convert to string to preserve EJSON format
        operationType: "update",
        fullDocument: fullDocument,
        updateDescription: updateDescription
      },
      encodeBodyAsJSON: true
    }).then(response => {
      console.log("Webhook response status:", response.statusCode);
      console.log("Webhook response body:", response.body.text());
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log("Webhook successfully delivered");
        return { success: true };
      } else {
        console.error("Failed to deliver webhook:", response.body.text());
        return { success: false, error: response.body.text() };
      }
    }).catch(err => {
      console.error("Error sending webhook:", err);
      return { success: false, error: err.toString() };
    });
  } catch (error) {
    console.error("Error in application status update trigger:", error);
    return { success: false, error: error.message };
  }
};`;
};

// Scholarship Created Trigger Function (for scholarships collection)
exports.scholarshipCreatedTrigger = (tunnelUrl) => {
  return `exports = function(changeEvent) {
  try {
    console.log("Trigger function called with event:", JSON.stringify(changeEvent));
    
    // Handle missing change event structure
    if (!changeEvent) {
      throw new Error("Change event is undefined");
    }
    
    // Get document ID and full document with fallbacks
    let documentId;
    let fullDocument;
    
    if (changeEvent.documentKey && changeEvent.documentKey._id) {
      documentId = changeEvent.documentKey._id;
    } else if (changeEvent._id) {
      documentId = changeEvent._id;
    } else if (changeEvent.fullDocument && changeEvent.fullDocument._id) {
      documentId = changeEvent.fullDocument._id;
    } else {
      // If we can't find an ID, generate a timestamp for logging
      documentId = new Date().toISOString();
    }
    
    if (changeEvent.fullDocument) {
      fullDocument = changeEvent.fullDocument;
    } else {
      // If fullDocument is missing, use the changeEvent itself as the document
      fullDocument = changeEvent;
    }
    
    console.log(\`Scholarship created trigger activated for ID: \${JSON.stringify(documentId)}\`);
    
    // Your localtunnel URL
    const localTunnelUrl = "${tunnelUrl}";
    
    // Make the webhook request - send the raw documentId (don't convert to string)
    const response = context.http.post({
      url: \`\${localTunnelUrl}/api/triggers/scholarship-created\`,
      body: {
        scholarshipId: documentId, // Do not convert to string to preserve EJSON format
        fullDocument: fullDocument
      },
      encodeBodyAsJSON: true,
      headers: {
        "Content-Type": ["application/json"]
      }
    });
    
    return response.then(response => {
      console.log(\`Webhook response status: \${response.statusCode}\`);
      console.log("Webhook response body:", response.body.text());
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log("Webhook successfully delivered");
        return { success: true };
      } else {
        console.error(\`Failed to deliver webhook: \${response.body.text()}\`);
        return { success: false, error: response.body.text() };
      }
    }).catch(err => {
      console.error(\`Error in HTTP request: \${err.message}\`);
      return { success: false, error: err.message };
    });
  } catch (error) {
    console.error(\`Error in scholarship created trigger: \${error.message}\`);
    return { success: false, error: error.message };
  }
};`;
};

// Scholarship Status Update Trigger Function (for scholarships collection)
exports.scholarshipStatusUpdateTrigger = (tunnelUrl) => {
  return `exports = function(changeEvent) {
  const scholarshipId = changeEvent.documentKey._id;
  const fullDocument = changeEvent.fullDocument;
  const updateDescription = changeEvent.updateDescription;
  
  // Your localtunnel URL
  const localTunnelUrl = "${tunnelUrl}";
  
  console.log("Scholarship status updated trigger activated:", scholarshipId);
  console.log("Updated fields:", JSON.stringify(updateDescription.updatedFields));
  
  // Send the webhook request to your tunnel
  return context.http.post({
    url: \`\${localTunnelUrl}/api/triggers/scholarship-status-updated\`,
    body: {
      scholarshipId: scholarshipId, // Do not convert to string to preserve EJSON format
      operationType: "update",
      fullDocument: fullDocument,
      updateDescription: updateDescription
    },
    encodeBodyAsJSON: true
  }).then(response => {
    console.log("Webhook response status:", response.statusCode);
    console.log("Webhook response body:", response.body.text());
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log("Webhook successfully delivered");
      return { success: true };
    } else {
      console.error("Failed to deliver webhook:", response.body.text());
      return { success: false, error: response.body.text() };
    }
  }).catch(err => {
    console.error("Error sending webhook:", err);
    return { success: false, error: err.toString() };
  });
};`;
}; 