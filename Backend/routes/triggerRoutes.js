const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const nodemailer = require('nodemailer');
const config = require('../config/env');

// Create email transporter with better error handling
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'mahad.j@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'etoceilaaqogvpgw'
    },
    // Add debug option to print detailed logs
    debug: true
  });
  
  // Verify connection configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take our messages');
    }
  });
} catch (error) {
  console.error('Error creating email transporter:', error);
}

// Enhanced helper function to send emails with better logging
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.error('Email transporter not initialized');
    return { success: false, error: 'Email transporter not initialized' };
  }
  
  try {
    console.log(`Attempting to send email to: ${to} with subject: ${subject}`);
    
    const mailOptions = {
      from: '"ScholarBridge" <notifications@scholarbridge.com>',
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { success: false, error: error.message };
  }
};

/**
 * Webhook test endpoint to verify trigger connectivity
 */
router.get('/triggers/test', (req, res) => {
  console.log('Trigger test endpoint hit');
  res.status(200).json({ 
    success: true, 
    message: 'Trigger webhook endpoint is working' 
  });
});

/**
 * Webhook for student application submitted
 * Triggered when a new application is created
 */
router.post('/triggers/application-submitted', async (req, res) => {
  try {
    console.log('Application submitted trigger received with payload:', JSON.stringify(req.body, null, 2));
    
    const { applicationId, fullDocument } = req.body;
    
    // Get application data - either from the webhook body or fetch it
    let application;
    if (fullDocument) {
      application = fullDocument;
    } else if (applicationId) {
      application = await Application.findById(applicationId);
    } else {
      return res.status(400).json({ success: false, message: 'No application data provided' });
    }
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Get student and scholarship data
    const student = await Student.findById(application.studentId);
    const scholarship = await Scholarship.findById(application.scholarshipId);
    
    if (!student || !scholarship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student or scholarship not found',
        studentFound: !!student,
        scholarshipFound: !!scholarship
      });
    }
    
    console.log(`Sending application submitted email to student: ${student.email}`);
    
    // Send email notification
    const subject = "Scholarship Application Submitted Successfully";
    const html = `
      <h2>Application Submitted Successfully</h2>
      <p>Dear ${student.firstName} ${student.lastName},</p>
      <p>Thank you for applying to the <strong>${scholarship.name}</strong> scholarship.</p>
      <p>Your application has been received and is currently under review.</p>
      <ul>
        <li><strong>Application ID:</strong> ${application._id}</li>
        <li><strong>Scholarship:</strong> ${scholarship.name}</li>
        <li><strong>Amount:</strong> $${scholarship.amount}</li>
        <li><strong>Status:</strong> Pending Review</li>
      </ul>
      <p>Our administrative team will review your application soon. You'll receive another email when there's an update.</p>
      <p>Best regards,<br>ScholarBridge Team</p>
    `;
    
    const emailResult = await sendEmail(student.email, subject, html);
    console.log('Email sending result:', emailResult);
    
    res.status(200).json({ 
      success: true, 
      message: 'Application submitted notification sent successfully',
      emailResult
    });
  } catch (error) {
    console.error('Error in application-submitted trigger webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Webhook for application status updated
 * Triggered when an application's status field is changed
 */
router.post('/triggers/application-status-updated', async (req, res) => {
  try {
    console.log('Application status updated trigger received with payload:', JSON.stringify(req.body, null, 2));
    
    const { applicationId, fullDocument, updateDescription } = req.body;
    
    // Get the new status - either from the update description or full document
    let newStatus;
    if (updateDescription && updateDescription.updatedFields && updateDescription.updatedFields.status) {
      newStatus = updateDescription.updatedFields.status;
    } else if (fullDocument && fullDocument.status) {
      newStatus = fullDocument.status;
    } else {
      return res.status(400).json({ success: false, message: 'No status update information provided' });
    }
    
    // Get application data
    let application;
    if (fullDocument) {
      application = fullDocument;
    } else if (applicationId) {
      application = await Application.findById(applicationId);
    } else {
      return res.status(400).json({ success: false, message: 'No application data provided' });
    }
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Get student and scholarship data
    const student = await Student.findById(application.studentId);
    const scholarship = await Scholarship.findById(application.scholarshipId);
    
    if (!student || !scholarship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student or scholarship not found',
        studentFound: !!student,
        scholarshipFound: !!scholarship
      });
    }
    
    console.log(`Sending application status update email to student: ${student.email}, new status: ${newStatus}`);
    
    // Generate status-specific message
    let statusMessage = "";
    switch(newStatus.toLowerCase()) {
      case "approved":
        statusMessage = `
          <p>Congratulations! Your application for the ${scholarship.name} scholarship has been approved.</p>
          <p>Your application has passed our initial review, and your details are now visible to potential donors.</p>
          <p>You will receive another notification once a donor decides to fund your scholarship.</p>
        `;
        break;
      case "rejected":
        statusMessage = `
          <p>We regret to inform you that your application for the ${scholarship.name} scholarship has not been approved.</p>
          <p>Our review committee has carefully evaluated your application against our criteria and other applicants.</p>
          <p>We encourage you to apply for other scholarships that may better match your qualifications.</p>
        `;
        break;
      case "funded":
        statusMessage = `
          <p>Congratulations! Your scholarship has been funded.</p>
          <p>A donor has committed to funding your tuition fee for the ${scholarship.name} scholarship.</p>
          <p>You'll receive more details about the funding process and next steps shortly.</p>
        `;
        break;
      default:
        statusMessage = `<p>Your application status has been updated to: ${newStatus}</p>`;
    }
    
    // Send email notification
    const subject = `Scholarship Application Update: ${newStatus.toUpperCase()}`;
    const html = `
      <h2>Application Status Update</h2>
      <p>Dear ${student.firstName} ${student.lastName},</p>
      ${statusMessage}
      <p>Application details:</p>
      <ul>
        <li><strong>Application ID:</strong> ${application._id}</li>
        <li><strong>Scholarship:</strong> ${scholarship.name}</li>
        <li><strong>Amount:</strong> $${scholarship.amount}</li>
        <li><strong>New Status:</strong> ${newStatus}</li>
      </ul>
      <p>Best regards,<br>ScholarBridge Team</p>
    `;
    
    const emailResult = await sendEmail(student.email, subject, html);
    console.log('Email sending result:', emailResult);
    
    res.status(200).json({ 
      success: true, 
      message: 'Application status update notification sent successfully',
      emailResult
    });
  } catch (error) {
    console.error('Error in application-status-updated trigger webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Webhook for scholarship created
 * Triggered when a new scholarship is created
 */
router.post('/triggers/scholarship-created', async (req, res) => {
  try {
    console.log('Scholarship created trigger received with payload:', JSON.stringify(req.body, null, 2));
    
    const { scholarshipId, fullDocument } = req.body;
    
    if (!scholarshipId) {
      return res.status(400).json({ success: false, message: 'No scholarship ID provided' });
    }
    
    // Get scholarship data - always fetch from database to ensure we have the latest data
    console.log(`Fetching scholarship with ID: ${scholarshipId}`);
    const scholarship = await Scholarship.findById(scholarshipId);
    
    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }
    
    console.log('Found scholarship:', scholarship);
    
    // Get donor data - using createdBy field
    const creatorId = scholarship.createdBy;
    if (!creatorId) {
      return res.status(400).json({ success: false, message: 'Scholarship has no creator ID' });
    }
    
    console.log('Looking up user with ID:', creatorId);
    
    // First check if the creator is a User
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }
    
    console.log('Found user:', user);
    
    // Check if the user is a donor
    if (user.role !== 'donor') {
      return res.status(400).json({ success: false, message: 'Creator is not a donor' });
    }
    
    // Send email notification
    const subject = "Scholarship Created Successfully";
    const html = `
      <h2>Scholarship Created Successfully</h2>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>Thank you for creating a new scholarship on ScholarBridge!</p>
      <p>Your scholarship is currently pending approval by our administrative team. You'll receive another notification when it's approved and made available to students.</p>
      
      <h3>Scholarship Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${scholarship.title || scholarship.name}</li>
        <li><strong>Amount:</strong> $${scholarship.amount}</li>
        <li><strong>Status:</strong> Pending Approval</li>
      </ul>
      
      <p>Thank you for your generosity and commitment to supporting education.</p>
      <p>Best regards,<br>ScholarBridge Team</p>
    `;
    
    console.log(`Sending scholarship created email to donor: ${user.email}`);
    const emailResult = await sendEmail(user.email, subject, html);
    console.log('Email sending result:', emailResult);
    
    res.status(200).json({ 
      success: true, 
      message: 'Scholarship created notification sent successfully',
      emailResult
    });
  } catch (error) {
    console.error('Error in scholarship-created trigger webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Webhook for scholarship status updated
 * Triggered when a scholarship's status field is changed
 */
router.post('/triggers/scholarship-status-updated', async (req, res) => {
  try {
    console.log('Scholarship status updated trigger received with payload:', JSON.stringify(req.body, null, 2));
    
    const { scholarshipId, fullDocument, updateDescription } = req.body;
    
    // Get the new status
    let newStatus;
    if (updateDescription && updateDescription.updatedFields && updateDescription.updatedFields.status) {
      newStatus = updateDescription.updatedFields.status;
    } else if (fullDocument && fullDocument.status) {
      newStatus = fullDocument.status;
    } else {
      return res.status(400).json({ success: false, message: 'No status update information provided' });
    }
    
    // Get scholarship data
    let scholarship;
    if (fullDocument) {
      scholarship = fullDocument;
    } else if (scholarshipId) {
      scholarship = await Scholarship.findById(scholarshipId);
    } else {
      return res.status(400).json({ success: false, message: 'No scholarship data provided' });
    }
    
    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }
    
    // Get donor data - using createdBy field instead of donorId
    const creatorId = scholarship.createdBy;
    if (!creatorId) {
      return res.status(400).json({ success: false, message: 'Scholarship has no creator ID' });
    }
    
    // First check if the creator is a User
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }
    
    // Check if the user is a donor
    if (user.role !== 'donor') {
      return res.status(400).json({ success: false, message: 'Creator is not a donor' });
    }
    
    console.log(`Sending scholarship status update email to donor: ${user.email}, new status: ${newStatus}`);
    
    // Generate status-specific message
    let statusMessage = "";
    switch(newStatus.toLowerCase()) {
      case "approved":
      case "active":
        statusMessage = `
          <p>We're pleased to inform you that your scholarship "${scholarship.title || scholarship.name}" has been approved!</p>
          <p>Your scholarship is now live on our platform and visible to eligible students.</p>
          <p>You'll receive notifications when students apply for this scholarship.</p>
        `;
        break;
      case "rejected":
        statusMessage = `
          <p>We regret to inform you that your scholarship "${scholarship.title || scholarship.name}" could not be approved.</p>
          <p>Our administrative team has reviewed your submission and found that it doesn't meet our current guidelines.</p>
          <p>Please contact our support team for more information and assistance in creating a new scholarship.</p>
        `;
        break;
      case "closed":
        statusMessage = `
          <p>Your scholarship "${scholarship.title || scholarship.name}" has been closed.</p>
          <p>This may be because all funds have been allocated or because the scholarship period has ended.</p>
          <p>You can view all funded students and their progress in your donor dashboard.</p>
        `;
        break;
      default:
        statusMessage = `
          <p>Your scholarship status has been updated to: ${newStatus}</p>
          <p>Please log in to your ScholarBridge account for more details.</p>
        `;
    }
    
    // Send email notification
    const subject = `Scholarship Status Update: ${newStatus.toUpperCase()}`;
    const html = `
      <h2>Scholarship Status Update</h2>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      ${statusMessage}
      <p>Scholarship details:</p>
      <ul>
        <li><strong>Scholarship ID:</strong> ${scholarship._id}</li>
        <li><strong>Name:</strong> ${scholarship.title || scholarship.name}</li>
        <li><strong>Amount:</strong> $${scholarship.amount}</li>
        <li><strong>New Status:</strong> ${newStatus}</li>
      </ul>
      <p>Thank you for your commitment to supporting education through ScholarBridge.</p>
      <p>Best regards,<br>ScholarBridge Team</p>
    `;
    
    const emailResult = await sendEmail(user.email, subject, html);
    console.log('Email sending result:', emailResult);
    
    res.status(200).json({ 
      success: true, 
      message: 'Scholarship status update notification sent successfully',
      emailResult
    });
  } catch (error) {
    console.error('Error in scholarship-status-updated trigger webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Debug endpoint for scholarship creation
 */
router.get('/triggers/debug-scholarship-created/:scholarshipId', async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    
    // Get scholarship data
    const scholarship = await Scholarship.findById(scholarshipId);
    
    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found' });
    }
    
    // Get donor data - using createdBy field instead of donorId
    const creatorId = scholarship.createdBy;
    if (!creatorId) {
      return res.status(400).json({ success: false, message: 'Scholarship has no creator ID' });
    }
    
    // First check if the creator is a User
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }
    
    // Check if the user is a donor
    if (user.role !== 'donor') {
      return res.status(400).json({ success: false, message: 'Creator is not a donor' });
    }
    
    // Get the donor details
    const donor = await Donor.findOne({ _id: creatorId });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor details not found' });
    }
    
    // Send email notification
    const subject = "Scholarship Created Successfully (Debug Test)";
    const html = `
      <h2>Scholarship Created Successfully</h2>
      <p>Dear ${user.firstName} ${user.lastName},</p>
      <p>Thank you for creating a new scholarship on ScholarBridge!</p>
      <p>Your scholarship is currently pending approval by our administrative team. You'll receive another notification when it's approved and made available to students.</p>
      
      <h3>Scholarship Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${scholarship.title || scholarship.name}</li>
        <li><strong>Amount:</strong> $${scholarship.amount}</li>
        <li><strong>Status:</strong> ${scholarship.status}</li>
      </ul>
      
      <p>Thank you for your generosity and commitment to supporting education.</p>
      <p>Best regards,<br>ScholarBridge Team</p>
    `;
    
    const emailResult = await sendEmail(user.email, subject, html);
    console.log('Debug email sending result:', emailResult);
    
    res.status(200).json({ 
      success: true, 
      message: 'Debug email sent successfully',
      scholarshipData: {
        id: scholarship._id,
        title: scholarship.title,
        name: scholarship.name,
        status: scholarship.status,
        createdBy: scholarship.createdBy
      },
      userData: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      emailResult
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;