# Brevo Email Integration Setup Guide

## Overview

This guide explains how to set up and use Brevo (SendinBlue) for sending emails in the MGV-Tech backend application.

## Prerequisites

- Node.js installed
- Brevo account created (https://www.brevo.com)
- Brevo API key generated

## Installation Steps

### 1. Install Brevo SDK Package

If you haven't already installed the Brevo SDK package, run:

```bash
npm install @getbrevo/brevo
```

### 2. Get Your Brevo API Key

1. Log in to your Brevo account (https://app.brevo.com)
2. Go to Settings → SMTP & API
3. Click on "API Keys" or "Create API Key"
4. Copy your API key (starts with `xkeysib-`)
5. Keep this key secure and never commit it to version control

### 3. Configure .env File

Add the following line to your `.env` file:

```env
BREVO_API_KEY=xkeysib-your-api-key-here
```

Example:

```env
BREVO_API_KEY=xkeysib-123456789abcdefghijklmnopqrstuvwxyz
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
EMAIL_USER=info@mgv-tech.com
FRONTEND_URL=https://mgv-tech.com
```

### 4. Verify Setup

Test that emails can be sent by making a request to any endpoint that sends emails (e.g., user registration, quote request).

## Email Service Functions

The `utils/brevoEmailService.js` file contains the following functions:

### 1. `sendEmail(emailData)`

Sends a single email to one recipient.

**Parameters:**

- `to` (string): Recipient email address
- `subject` (string): Email subject
- `html` (string): HTML email content
- `from` (string, optional): Sender email (defaults to EMAIL_USER)
- `cc` (string|array, optional): CC recipients

**Example:**

```javascript
await sendEmail({
  to: "user@example.com",
  subject: "Welcome",
  html: "<h1>Welcome!</h1>",
});
```

### 2. `sendEmailToMultiple(recipients, subject, html, from)`

Sends an email to multiple recipients.

**Parameters:**

- `recipients` (array): Array of objects with `email` and optional `name`
- `subject` (string): Email subject
- `html` (string): HTML email content
- `from` (string, optional): Sender email

**Example:**

```javascript
await sendEmailToMultiple(
  [
    { email: "user1@example.com", name: "User One" },
    { email: "user2@example.com", name: "User Two" },
  ],
  "Newsletter",
  "<h1>Monthly Newsletter</h1>"
);
```

### 3. `sendEmailToAdmins(subject, html, from)`

Sends email to all admin emails listed in ADMIN_EMAILS environment variable.

**Parameters:**

- `subject` (string): Email subject
- `html` (string): HTML email content
- `from` (string, optional): Sender email

**Example:**

```javascript
await sendEmailToAdmins(
  "New User Registration",
  "<p>A new user has registered</p>"
);
```

### 4. `sendWelcomeEmail(userData)`

Sends a welcome email to a new user.

**Parameters:**

- `userData.name` (string): User's name
- `userData.email` (string): User's email

### 5. `sendPasswordResetEmail(email, resetLink)`

Sends password reset email.

**Parameters:**

- `email` (string): User's email
- `resetLink` (string): Password reset URL

### 6. `sendQuoteRequestEmail(quoteData)`

Sends quote request confirmation to customer and notification to admins.

**Parameters:**

- `quoteData.name` (string): Customer name
- `quoteData.email` (string): Customer email
- `quoteData.phone` (string): Customer phone
- `quoteData.service` (string): Service requested
- `quoteData.message` (string): Quote message

### 7. `sendNewsletterEmail(newsletterData)`

Sends newsletter to subscribers.

**Parameters:**

- `newsletterData.subject` (string): Newsletter subject
- `newsletterData.htmlContent` (string): Newsletter HTML
- `newsletterData.recipients` (array): Recipient emails

### 8. `sendNewsletterConfirmationEmail(subscriberData)`

Sends subscription confirmation email.

**Parameters:**

- `subscriberData.name` (string): Subscriber name
- `subscriberData.email` (string): Subscriber email
- `subscriberData.unsubscribeUrl` (string): Unsubscribe link

## Controllers Using Brevo

### quoteController.js

- `sendQuoteRequest()` - Sends quote request confirmation
- `assignQuoteToAdmin()` - Notifies admin of quote assignment
- `adminReplyToQuoteRequest()` - Sends reply to customer
- `customerReplyToQuote()` - Notifies admins of customer reply

### userController.js

- `register()` - Sends welcome email and admin notification
- `requestPasswordReset()` - Sends password reset link

### newsletterController.js

- `subscribe()` - Sends subscription confirmation
- `sendNewsletter()` - Sends newsletter to subscribers

## Error Handling

All email functions include error handling and logging:

```javascript
await sendEmail({...}).catch(error =>
  console.error('Email send failed:', error)
);
```

For async operations, use try-catch:

```javascript
try {
  await sendEmail({...});
} catch (error) {
  console.error('Email error:', error.message);
}
```

## Testing

### Test 1: Register a New User

```bash
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "SecurePassword123"
}
```

Expected: Welcome email sent to user, admin notification sent to ADMIN_EMAILS

### Test 2: Send Quote Request

```bash
POST /api/quotes
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+234 801 234 5678",
  "service": "Web Development",
  "message": "I need a new website"
}
```

Expected: Confirmation email sent to customer, admin notification sent

### Test 3: Request Password Reset

```bash
POST /api/auth/request-password-reset
{
  "email": "user@example.com"
}
```

Expected: Password reset email sent to user with reset link

## Troubleshooting

### Issue: "BREVO_API_KEY not set in .env file"

**Solution:** Add your Brevo API key to the `.env` file as shown in step 3.

### Issue: Emails not being sent

**Possible causes:**

1. API key is invalid or expired
2. Recipient email address is invalid
3. Brevo API is down (check Brevo status page)
4. Email HTML contains invalid syntax
5. Rate limiting (Brevo has rate limits on free plans)

**Solutions:**

1. Verify API key in Brevo dashboard
2. Check email addresses are valid
3. Check Brevo API logs in dashboard
4. Validate HTML email content
5. Implement rate limiting in your code

### Issue: Emails going to spam

**Solutions:**

1. Ensure "From" address is verified in Brevo
2. Add SPF and DKIM records to your domain
3. Include unsubscribe links in marketing emails
4. Avoid spam trigger words
5. Monitor Brevo delivery reports

## Best Practices

1. **Always handle errors gracefully** - Use try-catch or .catch() handlers
2. **Log important email events** - Include logging for debugging
3. **Use templates** - Create reusable email templates
4. **Test in development** - Use test email addresses before production
5. **Monitor delivery** - Check Brevo dashboard for bounce/complaint rates
6. **Respect rate limits** - Implement delays for bulk sends
7. **Secure API keys** - Never commit .env files or API keys
8. **Use environment variables** - Keep sensitive data in .env

## Advanced Features

### Setting CC Recipients

```javascript
await sendEmail({
  to: "primary@example.com",
  cc: ["cc1@example.com", "cc2@example.com"],
  subject: "Test",
  html: "<p>Test email</p>",
});
```

### Custom Sender Email

```javascript
await sendEmail({
  to: "user@example.com",
  from: "noreply@mgv-tech.com",
  subject: "Test",
  html: "<p>Test email</p>",
});
```

## Monitoring and Analytics

In your Brevo dashboard, you can:

- View delivery reports for all sent emails
- Monitor bounce and complaint rates
- Track email opens and clicks (with tracking enabled)
- Manage subscriber lists
- View API usage statistics

## Support

For Brevo API documentation: https://developers.brevo.com
For support issues: Create an issue in the repository or contact Brevo support

## Migration Notes

### From Nodemailer to Brevo

- Removed all `nodemailer.createTransport()` calls
- Updated all `transporter.sendMail()` to use Brevo functions
- Simplified error handling
- Centralized email logic in `brevoEmailService.js`
- Better rate limiting and error tracking

### Files Modified

- `controllers/quoteController.js`
- `controllers/userController.js`
- `controllers/newsletterController.js` (if applicable)
- `package.json` - Added @getbrevo/brevo dependency
- `.env` - Added BREVO_API_KEY

## Version Info

- Brevo SDK: ^1.2.1
- Last Updated: December 3, 2025
