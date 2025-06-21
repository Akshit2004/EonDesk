import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/emailConfig';

/**
 * Validate EmailJS configuration
 * @returns {Object} - Validation result
 */
const validateEmailConfig = () => {
  const errors = [];
  
  if (!EMAIL_CONFIG.USER_ID || EMAIL_CONFIG.USER_ID === 'YOUR_PUBLIC_KEY_HERE') {
    errors.push('EmailJS Public Key (USER_ID) is not configured');
  }
  
  if (!EMAIL_CONFIG.SERVICE_ID || EMAIL_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID_HERE') {
    errors.push('EmailJS Service ID is not configured');
  }
  
  if (!EMAIL_CONFIG.TEMPLATES.TICKET_CONFIRMATION || EMAIL_CONFIG.TEMPLATES.TICKET_CONFIRMATION === 'YOUR_TICKET_CONFIRMATION_TEMPLATE_ID') {
    errors.push('Ticket confirmation template ID is not configured');
  }
  
  if (!EMAIL_CONFIG.TEMPLATES.SUPPORT_NOTIFICATION || EMAIL_CONFIG.TEMPLATES.SUPPORT_NOTIFICATION === 'YOUR_SUPPORT_NOTIFICATION_TEMPLATE_ID') {
    errors.push('Support notification template ID is not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Initialize EmailJS with your user ID
 */
export const initializeEmailJS = () => {
  const validation = validateEmailConfig();
  
  if (!validation.isValid) {
    console.warn('⚠️ EmailJS configuration incomplete:', validation.errors);
    console.warn('Please update src/config/emailConfig.js with your EmailJS credentials');
    return false;
  }
  
  emailjs.init(EMAIL_CONFIG.USER_ID);
  console.log('✅ EmailJS initialized successfully');
  return true;
};

/**
 * Send automated ticket confirmation email
 * @param {Object} ticketData - The ticket data containing customer info and ticket details
 * @returns {Promise<Object>} - Result of email sending operation
 */
export const sendTicketConfirmationEmail = async (ticketData) => {
  try {
    const validation = validateEmailConfig();
    
    if (!validation.isValid) {
      const errorMessage = `EmailJS not properly configured: ${validation.errors.join(', ')}`;
      console.error('❌', errorMessage);
      console.error('Please visit https://dashboard.emailjs.com/admin/account to get your credentials');
      
      return {
        success: false,
        error: errorMessage,
        details: { configErrors: validation.errors }
      };
    }

    console.log('🔧 Sending confirmation email with config:', {
      serviceId: EMAIL_CONFIG.SERVICE_ID,
      templateId: EMAIL_CONFIG.TEMPLATES.TICKET_CONFIRMATION,
      userId: EMAIL_CONFIG.USER_ID
    });    const templateParams = {
      to_email: ticketData.customer_email,
      customer_name: ticketData.customer_name || 'Customer',
      ticket_id: ticketData.ticketId || ticketData.ticket_id,
      ticket_title: ticketData.title,
      ticket_description: ticketData.description || 'No description provided',
      ticket_priority: ticketData.priority,
      ticket_category: ticketData.category,
      support_email: EMAIL_CONFIG.SUPPORT_EMAIL,
      current_date: new Date().toLocaleDateString(),
      current_time: new Date().toLocaleTimeString()
    };

    console.log('📧 Template params:', templateParams);
    console.log('📧 Recipient should be:', ticketData.customer_email);

    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATES.TICKET_CONFIRMATION,
      templateParams,
      EMAIL_CONFIG.USER_ID
    );

    console.log('✅ Email sent successfully:', response);
    return {
      success: true,
      response,
      message: 'Confirmation email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      text: error.text
    });
      // Provide more helpful error messages
    let userFriendlyError = error.message || 'Failed to send confirmation email';
    
    if (error.status === 400 && error.text?.includes('Public Key is invalid')) {
      userFriendlyError = 'EmailJS Public Key is invalid. Please check your configuration in emailConfig.js';
    } else if (error.status === 400 && error.text?.includes('Service ID')) {
      userFriendlyError = 'EmailJS Service ID is invalid. Please check your configuration in emailConfig.js';
    } else if (error.status === 400 && error.text?.includes('Template ID')) {
      userFriendlyError = 'EmailJS Template ID is invalid. Please check your template configuration';
    }
    
    return {
      success: false,
      error: userFriendlyError,
      details: error
    };
  }
};

/**
 * Create a formatted email template for ticket confirmation
 * This is a backup function that creates an HTML email template
 * in case you want to use a different email service
 */
export const createTicketConfirmationTemplate = (ticketData) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .ticket-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .ticket-id { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .priority-high { color: #dc2626; }
        .priority-medium { color: #d97706; }
        .priority-low { color: #059669; }
        .priority-urgent { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Support Ticket Created</h1>
            <p>Your support request has been received</p>
        </div>
        
        <div class="content">
            <p>Dear ${ticketData.customer_name || 'Customer'},</p>
            
            <p>Thank you for contacting our support team. We have successfully created a support ticket for your request.</p>
              <div class="ticket-info">
                <h3>Ticket Details:</h3>
                <p><strong>Ticket ID:</strong> <span class="ticket-id">${ticketData.ticketId || ticketData.ticket_id}</span></p>
                <p><strong>Subject:</strong> ${ticketData.title}</p>
                <p><strong>Category:</strong> ${ticketData.category}</p>
                <p><strong>Priority:</strong> <span class="priority-${ticketData.priority}">${ticketData.priority.toUpperCase()}</span></p>
                <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="ticket-info">
                <h3>Your Message:</h3>
                <p>${ticketData.description}</p>
            </div>
            
            <h3>What's Next?</h3>
            <ul>
                <li>Our support team will review your ticket and respond within 24 hours</li>
                <li>You will receive email updates when there are new responses</li>
                <li>You can track your ticket status using your Ticket ID: <strong>${ticketData.ticketId || ticketData.ticket_id}</strong></li>
                <li>Please save this Ticket ID for future reference</li>
            </ul>
            
            <p><strong>Need to update your ticket?</strong><br>
            Reply to this email or visit our support portal with your ticket ID.</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message from EON Support System</p>
            <p>Support Email: s78841441@gmail.com</p>
            <p>Please do not reply directly to this email</p>
        </div>
    </div>
</body>
</html>`;
};

/**
 * Test function to verify email service configuration
 * This sends a simple test email to verify the setup is working
 */
export const sendTestEmail = async (testEmail = 's78841441@gmail.com') => {
  try {
    const templateParams = {
      to_email: testEmail,
      customer_name: 'Test User',
      ticket_id: 'TEST-123456789',
      ticket_title: 'Test Email Service',
      ticket_description: 'This is a test email to verify the automated email system is working correctly.',
      ticket_priority: 'medium',
      ticket_category: 'technical',
      support_email: EMAIL_CONFIG.SUPPORT_EMAIL,
      current_date: new Date().toLocaleDateString(),
      current_time: new Date().toLocaleTimeString()
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATES.TICKET_CONFIRMATION,
      templateParams
    );

    return {
      success: true,
      response,
      message: 'Test email sent successfully'
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send test email'
    };
  }
};

/**
 * Simple test to check EmailJS connectivity
 * Uses EmailJS's test service to verify basic setup
 */
export const testEmailJSConnection = async () => {
  try {
    console.log('🔧 Testing EmailJS connection...');
    
    const validation = validateEmailConfig();
    console.log('📋 Config validation:', validation);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Configuration issues found: ' + validation.issues.join(', ')
      };
    }

    // Test with minimal parameters
    const testParams = {
      to_email: EMAIL_CONFIG.SUPPORT_EMAIL,
      test_message: 'EmailJS connection test'
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATES.TICKET_CONFIRMATION,
      testParams
    );

    return {
      success: true,
      response,
      message: 'EmailJS connection successful'
    };
  } catch (error) {
    console.error('❌ EmailJS connection test failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

/**
 * Send notification email to support team
 * @param {Object} ticketData - The ticket data
 * @returns {Promise<Object>} - Result of email sending operation
 */
export const sendSupportNotificationEmail = async (ticketData) => {
  try {
    const validation = validateEmailConfig();
    
    if (!validation.isValid) {
      const errorMessage = `EmailJS not properly configured: ${validation.errors.join(', ')}`;
      console.error('❌', errorMessage);
      console.error('Please visit https://dashboard.emailjs.com/admin/account to get your credentials');
      
      return {
        success: false,
        error: errorMessage,
        details: { configErrors: validation.errors }
      };
    }

    console.log('🔧 Sending support notification with config:', {
      serviceId: EMAIL_CONFIG.SERVICE_ID,
      templateId: EMAIL_CONFIG.TEMPLATES.SUPPORT_NOTIFICATION,
      userId: EMAIL_CONFIG.USER_ID
    });    const templateParams = {
      to_email: EMAIL_CONFIG.SUPPORT_EMAIL,
      ticket_id: ticketData.ticketId || ticketData.ticket_id,
      customer_name: ticketData.customer_name,
      customer_email: ticketData.customer_email,
      ticket_title: ticketData.title,
      ticket_description: ticketData.description,
      ticket_priority: ticketData.priority,
      ticket_category: ticketData.category,
      current_date: new Date().toLocaleDateString(),
      current_time: new Date().toLocaleTimeString()
    };

    console.log('📧 Support notification params:', templateParams);    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATES.SUPPORT_NOTIFICATION,
      templateParams,
      EMAIL_CONFIG.USER_ID
    );

    console.log('✅ Support notification sent successfully:', response);
    return {
      success: true,
      response,
      message: 'Support team notification sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending support notification:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      text: error.text
    });
    
    // Provide more helpful error messages
    let userFriendlyError = error.message || 'Failed to send support notification';
    
    if (error.status === 400 && error.text?.includes('Public Key is invalid')) {
      userFriendlyError = 'EmailJS Public Key is invalid. Please check your configuration in emailConfig.js';
    } else if (error.status === 400 && error.text?.includes('Service ID')) {
      userFriendlyError = 'EmailJS Service ID is invalid. Please check your configuration in emailConfig.js';
    } else if (error.status === 400 && error.text?.includes('Template ID')) {
      userFriendlyError = 'EmailJS Template ID is invalid. Please check your template configuration';
    }
    
    return {
      success: false,
      error: userFriendlyError,
      details: error
    };
  }
};
