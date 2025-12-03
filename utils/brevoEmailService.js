const brevo = require('@getbrevo/brevo');
require('dotenv').config();

// Initialize Brevo client
let apiInstance = null;
let isBrevoConfigured = false;

// Set API key
const apiKey = process.env.BREVO_API_KEY;

// Check if API key is valid (not the placeholder)
if (apiKey && apiKey !== 'your_brevo_api_key_here' && apiKey.startsWith('xkeysib-')) {
  apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.ApiKeyAuth, apiKey);
  isBrevoConfigured = true;
  console.log('✅ Brevo email service configured successfully');
} else {
  console.warn('⚠️ BREVO_API_KEY is not properly configured in .env file.');
  console.warn('📌 To enable email sending, add your Brevo API key to .env: BREVO_API_KEY=xkeysib-xxx');
  console.warn('📧 Emails will be logged to console instead.');
}

/**
 * Send email using Brevo API (with fallback for development)
 * @param {Object} emailData - Email data object
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML content
 * @param {string} emailData.from - Sender email (default: info@mgv-tech.com)
 * @param {string} emailData.cc - CC email addresses (optional)
 * @returns {Promise<Object>} Response from Brevo API
 */
async function sendEmail(emailData) {
  try {
    const {
      to,
      subject,
      html,
      from = process.env.EMAIL_USER || 'info@mgv-tech.com',
      cc = null
    } = emailData;

    if (!to || !subject || !html) {
      throw new Error('Missing required email fields: to, subject, html');
    }

    // If Brevo is not configured, log and return success (for development)
    if (!isBrevoConfigured) {
      console.log(`📧 [DEV MODE] Email would be sent:`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   From: ${from}`);
      return {
        success: true,
        messageId: 'DEV_MODE_' + Date.now(),
        email: to,
        mode: 'development'
      };
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: 'Marshall Global Ventures',
      email: from
    };
    sendSmtpEmail.to = [{ email: to }];

    if (cc) {
      if (Array.isArray(cc)) {
        sendSmtpEmail.cc = cc.map(email => ({ email }));
      } else {
        sendSmtpEmail.cc = [{ email: cc }];
      }
    }

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log(`✅ Email sent successfully to ${to}. Message ID: ${response.messageId}`);
    return {
      success: true,
      messageId: response.messageId,
      email: to
    };
  } catch (error) {
    console.error(`❌ Error sending email to ${emailData.to}:`, error.message);
    return {
      success: false,
      email: emailData.to,
      error: error.message
    };
  }
}

/**
 * Send email to multiple recipients
 * @param {Array<Object>} recipients - Array of recipient objects
 * @param {string} recipients[].email - Recipient email
 * @param {string} recipients[].name - Recipient name (optional)
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} from - Sender email (default: info@mgv-tech.com)
 * @returns {Promise<Object>} Results object with success count and details
 */
async function sendEmailToMultiple(recipients, subject, html, from = null) {
  try {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Recipients must be a non-empty array');
    }

    // If Brevo is not configured, log and return success
    if (!isBrevoConfigured) {
      console.log(`📧 [DEV MODE] Email would be sent to ${recipients.length} recipients:`);
      console.log(`   Recipients: ${recipients.map(r => r.email).join(', ')}`);
      console.log(`   Subject: ${subject}`);
      return {
        success: true,
        messageId: 'DEV_MODE_' + Date.now(),
        recipientCount: recipients.length,
        recipients: recipients.map(r => r.email),
        mode: 'development'
      };
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: 'Marshall Global Ventures',
      email: from || process.env.EMAIL_USER || 'info@mgv-tech.com'
    };
    sendSmtpEmail.to = recipients.map(recipient => ({
      email: recipient.email,
      name: recipient.name || undefined
    }));

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Email sent to ${recipients.length} recipients. Message ID: ${response.messageId}`);
    return {
      success: true,
      messageId: response.messageId,
      recipientCount: recipients.length,
      recipients: recipients.map(r => r.email)
    };
  } catch (error) {
    console.error('❌ Error sending email to multiple recipients:', error.message);
    return {
      success: false,
      error: error.message,
      recipientCount: recipients.length
    };
  }
}

/**
 * Send email to admin(s) - parses comma-separated emails from ADMIN_EMAILS env variable
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} from - Sender email (default: info@mgv-tech.com)
 * @returns {Promise<Object>} Results object
 */
async function sendEmailToAdmins(subject, html, from = null) {
  try {
    // If Brevo is not configured, log and return success
    if (!isBrevoConfigured) {
      const adminEmailsString = process.env.ADMIN_EMAILS || '';
      const adminEmails = adminEmailsString
        .split(',')
        .map(e => e.trim())
        .filter(e => e && e.includes('@'));

      console.log(`📧 [DEV MODE] Email would be sent to admins:`);
      console.log(`   Recipients: ${adminEmails.join(', ')}`);
      console.log(`   Subject: ${subject}`);
      return {
        success: true,
        messageId: 'DEV_MODE_' + Date.now(),
        mode: 'development'
      };
    }

    const adminEmailsString = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsString
      .split(',')
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));

    if (adminEmails.length === 0) {
      throw new Error('No admin emails configured in ADMIN_EMAILS');
    }

    const recipients = adminEmails.map(email => ({ email }));
    const result = await sendEmailToMultiple(recipients, subject, html, from);
    return result;
  } catch (error) {
    console.error('❌ Error sending email to admins:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send quote request notification email
 * @param {Object} quoteData - Quote request data
 * @returns {Promise<Object>} Result object
 */
async function sendQuoteRequestEmail(quoteData) {
  const { name, email, phone, service, message } = quoteData;

  // Email to admins
  const adminEmailHtml = `
    <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures!</h1>
      </div>
      <div style="padding:32px 24px 24px 24px;">
        <p><strong>Hello Admin,</strong></p>
        <p>A new quote request has just been submitted through the Marshall Global Ventures website. Please review the details below:</p>
        <p><strong>Service Requested:</strong> ${service}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>From:</strong> ${name} (${email}) (${phone})</p>
        <br />
        <p>Please <a href="https://mgv-tech.com/login">log in</a> to your admin dashboard to follow up or assign this request to a team member.</p>
      </div>
      <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
        <p style="margin:0 0 8px 0;">&copy; 2025 Marshall Global Ventures. All rights reserved.</p>
        <p style="margin:0 0 16px 0;">
          Email: <a href="mailto:info@mgv-tech.com" style="color:#00B9F1;text-decoration:none;">info@mgv-tech.com</a> | Phone: <a href="tel:+2348103069432" style="color:#00B9F1;text-decoration:none;">(+234) 08103069432</a>
        </p>
      </div>
    </div>
  `;

  // Email to customer
  const customerEmailHtml = `
    <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures!</h1>
      </div>
      <div style="padding:32px 24px 24px 24px;">
        <h2>Thank you for submitting a quote request through the IT Marshall Global Ventures website!</h2>
        <p>Dear ${name},</p>
        <p>We have received your request for <strong>${service}</strong> and we are currently reviewing the details of your request to ensure we provide the most accurate and tailored response.</p>
        <p>One of our IT experts will contact you shortly to discuss your requirements and the best solutions available. We appreciate your interest and trust in Marshall Global Ventures.</p>
        <p>If you have any additional information you would like to share in the meantime, please feel free to reply to this email.</p>
        <p><strong>Your message:</strong> ${message}</p>
        <p>Kind regards, <br/> <strong>Marshall Global Ventures Team</strong></p>
      </div>
      <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
        <p style="margin:0 0 8px 0;">&copy; 2025 Marshall Global Ventures. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const adminResult = await sendEmailToAdmins(
      `Quote Request from ${name} on Marshall Global Ventures`,
      adminEmailHtml
    );

    const customerResult = await sendEmail({
      to: email,
      subject: `We Received Your Quote Request on Marshall Global Ventures | ${service}`,
      html: customerEmailHtml
    });

    return {
      success: adminResult.success && customerResult.success,
      admin: adminResult,
      customer: customerResult
    };
  } catch (error) {
    console.error('❌ Error in sendQuoteRequestEmail:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send welcome email to new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Result object
 */
async function sendWelcomeEmail(userData) {
  const { name, email } = userData;

  const html = `
    <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures!</h1>
      </div>
      <div style="padding:32px 24px 24px 24px;">
        <p>Dear ${name},</p>
        <p>Welcome to <strong>Marshall Global Ventures</strong>!</p>
        <p>Your account has been successfully created. You can now access our platform and explore our services.</p>
        <p>If you have any questions or need support, please don't hesitate to reach out to us.</p>
        <p>Best regards,<br/><strong>Marshall Global Ventures Team</strong></p>
      </div>
      <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
        <p style="margin:0 0 8px 0;">&copy; 2025 Marshall Global Ventures. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Welcome to Marshall Global Ventures',
    html
  });
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetLink - Reset link with token
 * @returns {Promise<Object>} Result object
 */
async function sendPasswordResetEmail(email, resetLink) {
  const html = `
    <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures!</h1>
      </div>
      <div style="padding:32px 24px 24px 24px;">
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        <a href="${resetLink}" style="display:inline-block;margin:18px 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br/><strong>Marshall Global Ventures Team</strong></p>
      </div>
      <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
        <p style="margin:0 0 8px 0;">&copy; 2025 Marshall Global Ventures. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Reset Your Password - Marshall Global Ventures',
    html
  });
}

/**
 * Send newsletter email
 * @param {Object} newsletterData - Newsletter data
 * @returns {Promise<Object>} Result object
 */
async function sendNewsletterEmail(newsletterData) {
  const { subject, htmlContent, recipients } = newsletterData;

  if (!recipients || recipients.length === 0) {
    return {
      success: false,
      error: 'No recipients provided'
    };
  }

  const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
  return await sendEmailToMultiple(recipientArray, subject, htmlContent);
}

/**
 * Send newsletter subscription confirmation
 * @param {Object} subscriberData - Subscriber data
 * @returns {Promise<Object>} Result object
 */
async function sendNewsletterConfirmationEmail(subscriberData) {
  const { name, email, unsubscribeUrl } = subscriberData;

  const html = `
    <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
      <div style="background:#00B9F1;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Marshall Global Ventures!</h1>
      </div>
      <div style="padding:32px 24px 24px 24px;">
        <p>Hello ${name || 'there'},</p>
        <p>Thank you for subscribing to our newsletter!</p>
        <p>You'll now receive updates about our latest services, projects, and news from Marshall Global Ventures.</p>
        <p>If you wish to unsubscribe in the future, you can do so using the link below:</p>
        <a href="${unsubscribeUrl}" style="display:inline-block;margin:18px 0;padding:10px 20px;background:#e0e0e0;color:#333;text-decoration:none;border-radius:4px;font-size:0.9rem;">Unsubscribe</a>
        <p>Best regards,<br/><strong>Marshall Global Ventures Team</strong></p>
      </div>
      <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
        <p style="margin:0 0 8px 0;">&copy; 2025 Marshall Global Ventures. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Newsletter Subscription Confirmed, ${name || email}`,
    html
  });
}

module.exports = {
  sendEmail,
  sendEmailToMultiple,
  sendEmailToAdmins,
  sendQuoteRequestEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNewsletterEmail,
  sendNewsletterConfirmationEmail
};
