// EmailJS Configuration
// IMPORTANT: You need to set up EmailJS account and replace these placeholder values
// Follow these steps:
// 1. Visit https://www.emailjs.com/ and create an account
// 2. Go to https://dashboard.emailjs.com/admin/account to find your Public Key
// 3. Create email service and templates in your EmailJS dashboard
// 4. Replace the placeholder values below with your actual IDs

export const EMAIL_CONFIG = {  // Your EmailJS Service ID (from EmailJS dashboard -> Email Services)
  SERVICE_ID: 'service_de4s9eb',
    // Your EmailJS Public Key (from EmailJS dashboard -> Account -> API Keys -> Public Key)
  USER_ID: 'Ms9pGgjitQtO2cwpk',
  // Template IDs for different email types (create these in EmailJS dashboard -> Email Templates)
  TEMPLATES: {
    // Template for customer ticket confirmation
    TICKET_CONFIRMATION: 'template_e3wxnec',
    
    // Template for support team notification (using same template as confirmation)
    SUPPORT_NOTIFICATION: 'template_e3wxnec'
  },
    // Support email address (your actual support email)
  SUPPORT_EMAIL: 's78841441@gmail.com'
};

// EmailJS Template Variables Guide:
// For Ticket Confirmation Template, include these variables:
// - {{to_email}} - Customer's email
// - {{customer_name}} - Customer's name
// - {{ticket_id}} - Generated ticket ID
// - {{ticket_title}} - Ticket subject
// - {{ticket_description}} - Ticket description
// - {{ticket_priority}} - Ticket priority
// - {{ticket_category}} - Ticket category
// - {{support_email}} - Support team email
// - {{current_date}} - Current date
// - {{current_time}} - Current time

// For Support Notification Template, include these variables:
// - {{to_email}} - Support team email
// - {{ticket_id}} - Generated ticket ID
// - {{customer_name}} - Customer's name
// - {{customer_email}} - Customer's email
// - {{ticket_title}} - Ticket subject
// - {{ticket_description}} - Ticket description
// - {{ticket_priority}} - Ticket priority
// - {{ticket_category}} - Ticket category
// - {{current_date}} - Current date
// - {{current_time}} - Current time
