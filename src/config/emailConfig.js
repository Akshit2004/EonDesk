

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
