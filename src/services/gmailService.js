import { EMAIL_CONFIG } from '../config/emailConfig';

class GmailService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_GMAIL_CLIENT_SECRET;
    this.refreshTokenValue = import.meta.env.VITE_GMAIL_REFRESH_TOKEN;
    this.supportEmail = EMAIL_CONFIG.SUPPORT_EMAIL;
  }

  /**
   * Get access token using refresh token
   */
  async getAccessToken() {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshTokenValue,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        return data.access_token;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Fetch emails from Gmail
   */
  async fetchEmails() {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      // First, get list of messages
      const messagesResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=to:${this.supportEmail}&maxResults=50`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      const messagesData = await messagesResponse.json();

      if (!messagesData.messages) {
        return [];
      }

      // Get detailed information for each message
      const emailPromises = messagesData.messages.map(async (message) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
            },
          }
        );
        return detailResponse.json();
      });

      const emailDetails = await Promise.all(emailPromises);

      // Format emails for display
      const formattedEmails = emailDetails.map(email => {
        const headers = email.payload.headers;
        const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

        // Get email body
        let body = '';
        if (email.payload.body && email.payload.body.data) {
          body = atob(email.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (email.payload.parts) {
          const textPart = email.payload.parts.find(part => part.mimeType === 'text/plain');
          if (textPart && textPart.body && textPart.body.data) {
            body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }
        }

        return {
          id: email.id,
          threadId: email.threadId,
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          date: new Date(parseInt(email.internalDate)),
          body: body,
          snippet: email.snippet,
          isRead: !email.labelIds?.includes('UNREAD'),
          labels: email.labelIds || []
        };
      });

      return formattedEmails.sort((a, b) => b.date - a.date);
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  /**
   * Send automated reply email with ticket number
   */
  async sendTicketConfirmationReply(originalEmail, ticketId) {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const replySubject = `Re: ${originalEmail.subject} - Ticket #${ticketId}`;
      const replyBody = `
Dear Customer,

Thank you for contacting our support team. We have received your inquiry and created a support ticket for you.

Ticket Details:
- Ticket ID: #${ticketId}
- Subject: ${originalEmail.subject}
- Date Created: ${new Date().toLocaleString()}
- Status: Open

Our support team will review your request and respond within 24 hours. You can use the ticket ID #${ticketId} to track the progress of your request.

If you have any additional information or questions, please reply to this email and include your ticket ID.

Best regards,
Support Team
${this.supportEmail}

---
Original Message:
From: ${originalEmail.from}
Date: ${originalEmail.date.toLocaleString()}
Subject: ${originalEmail.subject}

${originalEmail.body}
      `;

      // Create the email message
      const emailMessage = [
        `To: ${originalEmail.from}`,
        `Subject: ${replySubject}`,
        `In-Reply-To: ${originalEmail.id}`,
        `References: ${originalEmail.id}`,
        '',
        replyBody
      ].join('\n');

      // Encode the message
      const encodedMessage = btoa(emailMessage).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      // Send the email
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
          threadId: originalEmail.threadId
        }),
      });

      const result = await response.json();
        if (response.ok) {
        console.log('Ticket confirmation email sent successfully');
        return { success: true, messageId: result.id };
      } else {
        console.error('Failed to send confirmation email:', result);
        return { 
          success: false, 
          error: result.error?.message || 'Failed to send confirmation email',
          details: result
        };
      }
    } catch (error) {
      console.error('Error sending ticket confirmation email:', error);
      return { 
        success: false, 
        error: error.message || 'Network error while sending confirmation email',
        details: error
      };
    }
  }

  /**
   * Archive/Hide email from dashboard
   */
  async archiveEmail(emailId) {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: ['INBOX'],
            addLabelIds: ['PROCESSED'] // Custom label for processed emails
          }),
        }
      );      if (response.ok) {
        console.log('Email archived successfully');
        return { success: true };
      } else {
        const result = await response.json();
        console.error('Failed to archive email:', result);
        return { 
          success: false, 
          error: result.error?.message || 'Failed to archive email',
          details: result
        };
      }
    } catch (error) {
      console.error('Error archiving email:', error);
      return { 
        success: false, 
        error: error.message || 'Network error while archiving email',
        details: error
      };
    }
  }

  /**
   * Extract ticket data from email for auto-population
   */
  extractTicketDataFromEmail(email) {
    // Extract name from email address
    const fromEmail = email.from;
    const emailMatch = fromEmail.match(/<(.+)>/);
    const senderEmail = emailMatch ? emailMatch[1] : fromEmail;
    
    // Try to extract name
    let senderName = fromEmail.replace(/<.+>/, '').trim();
    if (senderName.startsWith('"') && senderName.endsWith('"')) {
      senderName = senderName.slice(1, -1);
    }
    if (!senderName || senderName === senderEmail) {
      senderName = senderEmail.split('@')[0];
    }

    // Categorize based on subject keywords
    const subject = email.subject.toLowerCase();
    let category = 'general';
    let priority = 'medium';

    if (subject.includes('bug') || subject.includes('error') || subject.includes('issue')) {
      category = 'bug';
      priority = 'high';
    } else if (subject.includes('billing') || subject.includes('payment') || subject.includes('invoice')) {
      category = 'billing';
      priority = 'medium';
    } else if (subject.includes('feature') || subject.includes('request') || subject.includes('suggestion')) {
      category = 'feature';
      priority = 'low';
    } else if (subject.includes('technical') || subject.includes('help') || subject.includes('support')) {
      category = 'technical';
      priority = 'medium';
    }

    // Set priority based on urgency keywords
    if (subject.includes('urgent') || subject.includes('asap') || subject.includes('emergency')) {
      priority = 'urgent';
    } else if (subject.includes('important') || subject.includes('critical')) {
      priority = 'high';
    }

    return {
      name: senderName,
      email: senderEmail,
      title: email.subject,
      category: category,
      priority: priority,
      description: `Email received from: ${email.from}\nDate: ${email.date.toLocaleString()}\n\n${email.body}`,
      originalEmailId: email.id,
      originalEmail: email
    };
  }
}

export default new GmailService();
