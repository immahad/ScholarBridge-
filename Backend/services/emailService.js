const nodemailer = require('nodemailer');
const config = require('../config/env');

/**
 * Email service for sending system notifications and alerts
 */

// Create reusable transporter object using environment config
const createTransporter = () => {
  // Check if email configuration is available
  if (!config.email.host || !config.email.port) {
    console.warn('Email service not configured properly. Emails will not be sent.');
    return null;
  }
  
  console.log('Creating email transporter with config:', {
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      // Redact password for security
      password: config.email.password ? '***PASSWORD_REDACTED***' : 'undefined'
    },
    from: config.email.from
  });
  
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @returns {Promise<Boolean>} - Success status
 */
const sendEmail = async (options) => {
  try {
    console.log('Attempting to send email:', {
      to: options.to,
      subject: options.subject
    });
    
    const transporter = createTransporter();
    
    // If transporter is not configured, log and return false
    if (!transporter) {
      console.log('Email not sent (transporter not configured):', options.subject);
      return false;
    }
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${options.fromName || 'Scholarship System'}" <${config.email.from}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error.message);
    console.error('Error details:', error);
    return false;
  }
};

/**
 * Send verification email to new user
 * @param {Object} user - User data with verificationToken
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendVerificationEmail = async (user) => {
  try {
    console.log('======= SENDING VERIFICATION EMAIL =======');
    console.log('To user:', user.email);
    console.log('With verification token:', user.verificationToken);
    console.log('Using frontend URL:', config.frontendUrl);
    console.log('Using backend URL:', config.backendUrl);
    
    const { email, firstName, verificationToken, role } = user;
    
    // Create only the direct verification link that will redirect to success page
    const directVerificationUrl = `${config.backendUrl}/api/auth/verify?token=${verificationToken}&role=${role}&email=${encodeURIComponent(email)}`;
    
    console.log('Direct verification URL:', directVerificationUrl);
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4a5568; text-align: center;">Verify Your Email Address</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering with ScholarBridge. To complete your registration, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${directVerificationUrl}" style="background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        
        <p>If the button above doesn't work, you can also click on this link:</p>
        <p><a href="${directVerificationUrl}">${directVerificationUrl}</a></p>
        
        <p>This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
        
        <p>Thank you,</p>
        <p>The ScholarBridge Team</p>
      </div>
    `;
    
    const result = await sendEmail({
      to: email,
      subject: 'Verify Your Email Address - ScholarBridge',
      html: emailContent
    });
    
    console.log('Verification email send result:', result);
    console.log('======= END VERIFICATION EMAIL =======');
    
    return result;
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    return false;
  }
};

/**
 * Send welcome email to new user
 * @param {Object} user - User data
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendWelcomeEmail = async (user) => {
  const { email, firstName, role } = user;
  
  const subject = 'Welcome to the Scholarship Management System';
  
  const text = `
    Hello ${firstName},
    
    Welcome to the Scholarship Management System! Your account has been created successfully as a ${role}.
    
    ${role === 'student' ? 'You can now browse and apply for scholarships.' : ''}
    ${role === 'donor' ? 'You can now browse and fund scholarships for deserving students.' : ''}
    ${role === 'admin' ? 'You can now manage users, scholarships, and applications.' : ''}
    
    Please visit ${config.frontendUrl} to access your account.
    
    Thank you,
    Scholarship Management System Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to the Scholarship Management System!</h2>
      <p>Hello ${firstName},</p>
      <p>Welcome to the Scholarship Management System! Your account has been created successfully as a <strong>${role}</strong>.</p>
      
      ${role === 'student' ? '<p>You can now browse and apply for scholarships.</p>' : ''}
      ${role === 'donor' ? '<p>You can now browse and fund scholarships for deserving students.</p>' : ''}
      ${role === 'admin' ? '<p>You can now manage users, scholarships, and applications.</p>' : ''}
      
      <p>Please <a href="${config.frontendUrl}">click here</a> to access your account.</p>
      
      <p>Thank you,<br>Scholarship Management System Team</p>
    </div>
  `;
  
  return await sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

/**
 * Send password reset email
 * @param {String} email - User email
 * @param {String} resetToken - Password reset token
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
  
  const subject = 'Password Reset Request';
  
  const text = `
    You are receiving this email because you (or someone else) has requested to reset your password.
    
    Please click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you did not request this, please ignore this email and your password will remain unchanged.
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
      
      <p>Please click the button below to reset your password:</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </p>
      
      <p>This link will expire in 1 hour.</p>
      
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      
      <p>Thank you,<br>Scholarship Management System Team</p>
    </div>
  `;
  
  return await sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

/**
 * Send application status update email
 * @param {Object} application - Application data
 * @param {Object} student - Student data
 * @param {Object} scholarship - Scholarship data
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendApplicationStatusEmail = async (application, student, scholarship) => {
  const { status } = application;
  const { email, firstName } = student;
  const { title } = scholarship;
  
  let subject, text, html;
  
  if (status === 'approved') {
    subject = 'Your Scholarship Application Has Been Approved!';
    
    text = `
      Hello ${firstName},
      
      Congratulations! Your application for the "${title}" scholarship has been approved.
      
      Your application will now be visible to potential donors who can fund your scholarship.
      
      You can check the status of your application by logging into your account at ${config.frontendUrl}.
      
      Thank you,
      Scholarship Management System Team
    `;
    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Scholarship Application Has Been Approved!</h2>
        <p>Hello ${firstName},</p>
        <p>Congratulations! Your application for the "${title}" scholarship has been approved.</p>
        
        <p>Your application will now be visible to potential donors who can fund your scholarship.</p>
        
        <p>You can check the status of your application by logging into your account at <a href="${config.frontendUrl}">${config.frontendUrl}</a>.</p>
        
        <p>Thank you,<br>Scholarship Management System Team</p>
      </div>
    `;
  } else if (status === 'rejected') {
    subject = 'Update on Your Scholarship Application';
    
    text = `
      Hello ${firstName},
      
      We regret to inform you that your application for the "${title}" scholarship has not been approved at this time.
      
      Please don't be discouraged. There are many other scholarship opportunities available on our platform.
      
      You can browse and apply for other scholarships by logging into your account at ${config.frontendUrl}.
      
      Thank you,
      Scholarship Management System Team
    `;
    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Update on Your Scholarship Application</h2>
        <p>Hello ${firstName},</p>
        <p>We regret to inform you that your application for the "${title}" scholarship has not been approved at this time.</p>
        
        <p>Please don't be discouraged. There are many other scholarship opportunities available on our platform.</p>
        
        <p>You can browse and apply for other scholarships by logging into your account at <a href="${config.frontendUrl}">${config.frontendUrl}</a>.</p>
        
        <p>Thank you,<br>Scholarship Management System Team</p>
      </div>
    `;
  } else if (status === 'funded') {
    subject = 'Congratulations! Your Scholarship Has Been Funded!';
    
    text = `
      Hello ${firstName},
      
      We are thrilled to inform you that your application for the "${title}" scholarship has been funded!
      
      Please log into your account at ${config.frontendUrl} for more details about the funding and next steps.
      
      Congratulations once again!
      
      Thank you,
      Scholarship Management System Team
    `;
    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations! Your Scholarship Has Been Funded!</h2>
        <p>Hello ${firstName},</p>
        <p>We are thrilled to inform you that your application for the "${title}" scholarship has been funded!</p>
        
        <p>Please log into your account at <a href="${config.frontendUrl}">${config.frontendUrl}</a> for more details about the funding and next steps.</p>
        
        <p>Congratulations once again!</p>
        
        <p>Thank you,<br>Scholarship Management System Team</p>
      </div>
    `;
  }
  
  if (subject) {
    return await sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }
  
  return false;
};

/**
 * Send donation confirmation email
 * @param {Object} payment - Payment data with studentId and scholarshipId for specific donations
 * @param {Object} donor - Donor data
 * @param {Object} scholarship - Scholarship data (optional for general donations)
 * @param {Object} student - Student data (optional for general donations)
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendDonationConfirmationEmail = async (payment, donor, scholarship, student) => {
  const { email, firstName } = donor;
  const { amount, transactionId, type, isAnonymous } = payment;
  
  // Different email content based on donation type
  let subject, text, html;
  
  if (type === 'student_scholarship') {
    // This is a donation to a specific student's scholarship
    const { title } = scholarship;
    
    subject = 'Thank You for Your Scholarship Donation';
    
    const studentName = student && !isAnonymous ? `${student.firstName} ${student.lastName}` : 'a deserving student';
    
    text = `
      Hello ${firstName},
      
      Thank you for your generous donation of $${amount.toFixed(2)} to fund the "${title}" scholarship for ${studentName}.
      
      Transaction ID: ${transactionId}
      Date: ${new Date().toLocaleDateString()}
      Amount: $${amount.toFixed(2)}
      
      Your generosity will help make education accessible and affordable for students in need.
      
      You can view your donation history by logging into your account at ${config.frontendUrl}.
      
      Thank you,
      Scholarship Management System Team
    `;
    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Your Scholarship Donation</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for your generous donation of <strong>$${amount.toFixed(2)}</strong> to fund the "${title}" scholarship for ${studentName}.</p>
        
        <div style="background-color: #f8f9fa; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        </div>
        
        <p>Your generosity will help make education accessible and affordable for students in need.</p>
        
        <p>You can view your donation history by logging into your account at <a href="${config.frontendUrl}">${config.frontendUrl}</a>.</p>
        
        <p>Thank you,<br>Scholarship Management System Team</p>
      </div>
    `;
  } else {
    // This is a general donation
    subject = 'Thank You for Your Donation';
    
    text = `
      Hello ${firstName},
      
      Thank you for your generous donation of $${amount.toFixed(2)} to support our platform.
      
      Transaction ID: ${transactionId}
      Date: ${new Date().toLocaleDateString()}
      Amount: $${amount.toFixed(2)}
      
      Your contribution helps us maintain and improve our platform, making education more accessible to students worldwide.
      
      You can view your donation history by logging into your account at ${config.frontendUrl}.
      
      Thank you for your support,
      Scholarship Management System Team
    `;
    
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Your Donation</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for your generous donation of <strong>$${amount.toFixed(2)}</strong> to support our platform.</p>
        
        <div style="background-color: #f8f9fa; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        </div>
        
        <p>Your contribution helps us maintain and improve our platform, making education more accessible to students worldwide.</p>
        
        <p>You can view your donation history by logging into your account at <a href="${config.frontendUrl}">${config.frontendUrl}</a>.</p>
        
        <p>Thank you for your support,<br>Scholarship Management System Team</p>
      </div>
    `;
  }
  
  return await sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

/**
 * Send scholarship approved email notification to donor
 * @param {String} email - Donor email
 * @param {String} scholarshipTitle - Title of the scholarship
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendScholarshipApprovedEmail = async (email, scholarshipTitle) => {
  const subject = 'Your Scholarship Has Been Approved';
  
  const text = `
    Congratulations!
    
    Your scholarship "${scholarshipTitle}" has been reviewed and approved by our administrators.
    
    Your scholarship is now active and visible to students on the platform. You will be notified when students apply for this scholarship.
    
    Thank you for contributing to students' education and future.
    
    Regards,
    ScholarBridge Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Scholarship Approved</h2>
      <p>Congratulations!</p>
      <p>Your scholarship "<strong>${scholarshipTitle}</strong>" has been reviewed and approved by our administrators.</p>
      <p>Your scholarship is now active and visible to students on the platform. You will be notified when students apply for this scholarship.</p>
      <p>Thank you for contributing to students' education and future.</p>
      <p>Regards,<br>ScholarBridge Team</p>
    </div>
  `;
  
  return await sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

/**
 * Send scholarship rejected email notification to donor
 * @param {String} email - Donor email
 * @param {String} scholarshipTitle - Title of the scholarship
 * @param {String} reason - Reason for rejection
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendScholarshipRejectedEmail = async (email, scholarshipTitle, reason) => {
  const subject = 'Your Scholarship Requires Revision';
  
  const text = `
    We've reviewed your scholarship "${scholarshipTitle}" and we need some changes before it can be approved.
    
    Reason: ${reason || 'No specific reason provided. Please contact support for more details.'}
    
    You can edit and resubmit your scholarship from your dashboard.
    
    If you need any assistance, please don't hesitate to contact our support team.
    
    Regards,
    ScholarBridge Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Scholarship Review Results</h2>
      <p>We've reviewed your scholarship "<strong>${scholarshipTitle}</strong>" and we need some changes before it can be approved.</p>
      <p><strong>Reason:</strong> ${reason || 'No specific reason provided. Please contact support for more details.'}</p>
      <p>You can edit and resubmit your scholarship from your dashboard.</p>
      <p>If you need any assistance, please don't hesitate to contact our support team.</p>
      <p>Regards,<br>ScholarBridge Team</p>
    </div>
  `;
  
  return await sendEmail({
    to: email,
    subject,
    text,
    html
  });
};

/**
 * Send registration success email (alternative to verification)
 * @param {Object} user - User object
 */
exports.sendRegistrationSuccessEmail = async (user) => {
  const { email, firstName, role } = user;
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #4a5568; text-align: center;">Registration Successful</h2>
      <p>Hello ${firstName},</p>
      <p>Thank you for registering with ScholarBridge. Your account has been created successfully as a <strong>${role}</strong>.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.frontendUrl}/login" style="background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
      </div>
      
      <p>You can now log in to your account and start using our platform.</p>
      
      <p>Thank you,</p>
      <p>The ScholarBridge Team</p>
    </div>
  `;
  
  await sendEmail({
    email,
    subject: 'Registration Successful - ScholarBridge',
    html: emailContent
  });
};

/**
 * Send general donation confirmation email
 * @param {Object} payment - Payment data
 * @param {Object} donor - Donor data
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendGeneralDonationConfirmationEmail = async (payment, donor) => {
  const { email, firstName } = donor;
  const { amount, transactionId } = payment;
  
  const subject = 'Thank You for Your Donation';
  
  const text = `
    Hello ${firstName},
    
    Thank you for your generous donation of $${amount.toFixed(2)} to support our platform.
    
    Transaction ID: ${transactionId}
    Date: ${new Date().toLocaleDateString()}
    Amount: $${amount.toFixed(2)}
    
    Your contribution helps us maintain and improve our platform, making education more accessible to students worldwide.
    
    You can view your donation history by logging into your account at ${config.frontendUrl}.
    
    Thank you for your support,
    Scholarship Management System Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thank You for Your Donation</h2>
      <p>Hello ${firstName},</p>
      <p>Thank you for your generous donation of <strong>$${amount.toFixed(2)}</strong> to support our platform.</p>
      
      <div style="background-color: #f8f9fa; border-radius: 4px; padding: 15px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      </div>
      
      <p>Your contribution helps us maintain and improve our platform, making education more accessible to students worldwide.</p>
      
      <p>You can view your donation history by logging into your account at <a href="${config.frontendUrl}">${config.frontendUrl}</a>.</p>
      
      <p>Thank you for your support,<br>Scholarship Management System Team</p>
    </div>
  `;
  
  try {
    await sendEmail({
      to: email,
      subject,
      text,
      html
    });
    return true;
  } catch (error) {
    console.error('Send general donation confirmation email error:', error);
    return false;
  }
};

/**
 * Send application notification
 * @param {Object} student - Student data
 * @param {Object} scholarship - Scholarship data
 * @param {Object} application - Application data
 * @param {String} type - Notification type ('submitted', 'status-updated', etc.)
 * @param {String} customSubject - Optional custom subject
 * @param {String} customHtml - Optional custom html content
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendApplicationNotification = async (student, scholarship, application, type, customSubject, customHtml) => {
  try {
    console.log(`Sending application ${type} notification to: ${student.email}`);
    
    let subject, html;
    
    if (customSubject && customHtml) {
      subject = customSubject;
      html = customHtml;
    } else {
      // Generate email content based on type
      switch (type) {
        case 'submitted':
          subject = "Scholarship Application Submitted Successfully";
          html = `
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
          break;
        
        default:
          subject = `Scholarship Application Update`;
          html = `
            <h2>Application Update</h2>
            <p>Dear ${student.firstName} ${student.lastName},</p>
            <p>There has been an update to your application for the <strong>${scholarship.name}</strong> scholarship.</p>
            <p>Please log in to your account to view the details.</p>
            <p>Best regards,<br>ScholarBridge Team</p>
          `;
      }
    }
    
    return await sendEmail({
      to: student.email,
      subject,
      html
    });
  } catch (error) {
    console.error('Error in sendApplicationNotification:', error);
    return false;
  }
};

/**
 * Send scholarship notification
 * @param {Object} user - User data (donor or admin)
 * @param {Object} scholarship - Scholarship data
 * @param {String} subject - Email subject
 * @param {String} html - Email html content
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendScholarshipNotification = async (user, scholarship, subject, html) => {
  try {
    console.log(`Sending scholarship notification to: ${user.email}`);
    
    return await sendEmail({
      to: user.email,
      subject,
      html
    });
  } catch (error) {
    console.error('Error in sendScholarshipNotification:', error);
    return false;
  }
};

/**
 * Send scholarship funded notification to student
 * @param {Object} student - Student data
 * @param {Object} scholarship - Scholarship data
 * @param {Object} payment - Payment data
 * @param {Object} donor - Donor data (may be null if anonymous)
 * @returns {Promise<Boolean>} - Success status
 */
exports.sendScholarshipFundedEmail = async (student, scholarship, payment, donor) => {
  const { email, firstName } = student;
  const { title, amount } = scholarship;
  const { isAnonymous } = payment;
  
  const subject = 'Congratulations! Your Scholarship Has Been Funded';
  
  let donorInfo = '';
  if (!isAnonymous && donor) {
    donorInfo = `
      <p>Your scholarship was funded by ${donor.firstName} ${donor.lastName}.</p>
    `;
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Congratulations! Your Scholarship Has Been Funded</h2>
      <p>Hello ${firstName},</p>
      <p>We are thrilled to inform you that your application for the "${title}" scholarship has been funded!</p>
      
      <div style="background-color: #f8f9fa; border-radius: 4px; padding: 15px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Scholarship:</strong> ${title}</p>
        <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      ${donorInfo}
      
      <p>Please log into your account at <a href="${config.frontendUrl}">${config.frontendUrl}</a> for more details about the funding and next steps.</p>
      
      <p>Congratulations once again!</p>
      
      <p>Thank you,<br>Scholarship Management System Team</p>
    </div>
  `;
  
  const text = `
    Hello ${firstName},
    
    We are thrilled to inform you that your application for the "${title}" scholarship has been funded!
    
    Scholarship: ${title}
    Amount: $${amount.toFixed(2)}
    Date: ${new Date().toLocaleDateString()}
    
    ${!isAnonymous && donor ? `Your scholarship was funded by ${donor.firstName} ${donor.lastName}.` : ''}
    
    Please log into your account at ${config.frontendUrl} for more details about the funding and next steps.
    
    Congratulations once again!
    
    Thank you,
    Scholarship Management System Team
  `;
  
  return await sendEmail({
    to: email,
    subject,
    text,
    html
  });
};
