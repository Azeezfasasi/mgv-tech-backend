# 🚀 Brevo Integration - Quick Start

## 1️⃣ Get Your Brevo API Key (2 minutes)

1. Go to https://www.brevo.com and log in
2. Click **Settings** → **SMTP & API**
3. Click **Create API Key** or view existing key
4. Copy your API key (looks like: `xkeysib-abc123...`)
5. Keep it safe!

## 2️⃣ Add to .env (1 minute)

Open `.env` file in the backend folder and add:

```env
BREVO_API_KEY=xkeysib-your-api-key-here
```

Example with real key:

```env
BREVO_API_KEY=xkeysib-1234567890abcdefghijklmnopqrstuvwxyz
ADMIN_EMAILS=admin@example.com,support@example.com
EMAIL_USER=noreply@mgv-tech.com
FRONTEND_URL=https://mgv-tech.com
```

## 3️⃣ Install Dependencies (1 minute)

```bash
cd "c:\Users\Azeez Fasasi\Desktop\React Dev\MGV-Tech Backend V2\mgv-tech-backend"
npm install
```

## 4️⃣ Test It (2 minutes)

### Test User Registration Email:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-test@gmail.com",
    "password": "TestPass123"
  }'
```

Check your email inbox! You should receive:

- ✅ Welcome email (to test user)
- ✅ Admin notification (to all ADMIN_EMAILS)

### Test Quote Request:

```bash
curl -X POST http://localhost:5000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+234 801 234 5678",
    "service": "Web Development",
    "message": "I need a website"
  }'
```

Expected emails:

- ✅ Confirmation to customer
- ✅ Notification to all admins

## 5️⃣ Available Email Functions

All these work out of the box:

```javascript
// 1. Send single email
await sendEmail({
  to: "user@example.com",
  subject: "Hello",
  html: "<h1>Welcome!</h1>",
});

// 2. Send to multiple people
await sendEmailToAdmins("New Quote", "<p>Quote from John</p>");

// 3. Send welcome email
await sendWelcomeEmail({
  name: "John",
  email: "john@example.com",
});

// 4. Send password reset
await sendPasswordResetEmail(
  "user@example.com",
  "https://yoursite.com/reset/token123"
);

// 5. Send quote confirmation
await sendQuoteRequestEmail({
  name: "John",
  email: "john@example.com",
  phone: "08012345678",
  service: "Web Dev",
  message: "I need a website",
});
```

## 📁 What Was Added/Changed

### New Files:

- ✅ `utils/brevoEmailService.js` - Main email service
- ✅ `BREVO_INTEGRATION_SETUP.md` - Full documentation
- ✅ `BREVO_INTEGRATION_SUMMARY.md` - Implementation summary

### Modified Files:

- ✅ `controllers/quoteController.js` - Uses Brevo
- ✅ `controllers/userController.js` - Uses Brevo
- ✅ `controllers/newsletterController.js` - Uses Brevo
- ✅ `package.json` - Added @getbrevo/brevo
- ✅ `.env` - Added BREVO_API_KEY

## ⚙️ Configuration

| Setting      | Value                  | Where               |
| ------------ | ---------------------- | ------------------- |
| API Key      | `xkeysib-...`          | `.env` file         |
| Admin Emails | `admin@ex.com,...`     | `.env` file         |
| Sender Email | `noreply@mgv-tech.com` | `.env` EMAIL_USER   |
| Frontend URL | `https://mgv-tech.com` | `.env` FRONTEND_URL |

## 🔍 Check If It's Working

1. **Logs**: Check console for `✅ Email sent successfully`
2. **Brevo Dashboard**: Go to Logs → see sent emails
3. **Inbox**: Receive test emails
4. **Error Handling**: `❌ Error sending email` if failed

## ❓ Troubleshooting

| Problem       | Solution                               |
| ------------- | -------------------------------------- |
| API key error | Add `BREVO_API_KEY` to `.env`          |
| No emails     | Check Brevo dashboard API key validity |
| In spam       | Configure DKIM/SPF for your domain     |
| Rate limit    | Wait or upgrade Brevo plan             |

## 📚 Full Documentation

- **Setup Guide**: `BREVO_INTEGRATION_SETUP.md`
- **API Reference**: In `utils/brevoEmailService.js`
- **Implementation**: See controllers in use

## 🎯 What's Different from Before

| Before (Nodemailer)  | After (Brevo)          |
| -------------------- | ---------------------- |
| SMTP connection      | API-based              |
| Scattered email code | Centralized service    |
| Manual rate limiting | Built-in               |
| Limited templates    | Professional templates |
| Single admin email   | Multi-admin support    |

## ✨ Features

- ✅ Single & batch emails
- ✅ Multi-admin support
- ✅ Professional templates
- ✅ Error handling
- ✅ Async sending
- ✅ Rate limiting
- ✅ Easy testing

## 🚀 Ready?

1. Add API key to `.env`
2. Run `npm install`
3. Restart the server
4. Test an endpoint
5. Check your email!

That's it! 🎉

---

**Questions?** Check `BREVO_INTEGRATION_SETUP.md` for detailed documentation.
