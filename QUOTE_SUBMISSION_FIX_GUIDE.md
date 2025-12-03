# Quick Troubleshooting Guide - Quote Submission 500 Error

## Issue Status: ✅ FIXED

Your quote submission endpoint now handles the invalid Brevo API key gracefully.

---

## What Was Wrong

**Error:** POST request returns 500 when submitting quote form

- Quote data saves to database ✓
- Email fails to send ✗
- Form shows "Sending..." forever ✗

**Root Cause:**

- `BREVO_API_KEY=your_brevo_api_key_here` (placeholder, not real key)
- Email service crashed due to invalid API key
- Error crashed the entire endpoint

---

## What's Fixed Now

### Quote Form Will Now:

✅ Submit successfully without errors
✅ Show "Success" message
✅ Save quote to database
✅ Log email content to backend console
✅ Continue working (gracefully) until you add real API key

### Backend Will Now:

✅ Validate API key on startup
✅ Show helpful warning if key missing
✅ Log emails to console instead of crashing
✅ Allow endpoints to complete successfully

---

## Testing the Fix

### 1. Start Backend

```powershell
cd c:\Users\Azeez Fasasi\Desktop\React Dev\MGV-Tech Backend V2\mgv-tech-backend
npm start
```

You should see one of these messages:

**If API key still invalid (current state):**

```
⚠️ BREVO_API_KEY is not properly configured in .env file.
📌 To enable email sending, add your Brevo API key to .env: BREVO_API_KEY=xkeysib-xxx
📧 Emails will be logged to console instead.
```

**If API key is valid:**

```
✅ Brevo email service configured successfully
```

### 2. Submit Quote Form

Go to your frontend and submit the quote request form with:

- Name: "Test User"
- Email: "test@example.com"
- Phone: "+1234567890"
- Service: "IT Services"
- Message: "Test quote request"

### 3. Check Results

**Frontend Should Show:**

- ✅ Success message
- ✅ Form clears
- ✅ No error

**Backend Console Should Show:**

```
📧 [DEV MODE] Email would be sent:
   To: test@example.com
   Subject: We Received Your Quote Request on Marshall Global Ventures | IT Services
   From: info@mgv-tech.com

📧 [DEV MODE] Email would be sent to admins:
   Recipients: admin@mgv-tech.com
   Subject: Quote Request from Test User on Marshall Global Ventures
```

---

## Enable Real Email Sending

### Step 1: Get Brevo API Key

1. Go to https://www.brevo.com
2. Sign in (or create free account)
3. Go to Settings → SMTP & API
4. Click "API Keys" tab
5. Copy your API key (starts with `xkeysib-`)

### Step 2: Update .env

Replace the placeholder in `.env`:

**Current:**

```env
BREVO_API_KEY=your_brevo_api_key_here
```

**New:**

```env
BREVO_API_KEY=xkeysib-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r
```

### Step 3: Restart Backend

```powershell
# Press Ctrl+C to stop current server
# Then run:
npm start
```

You should see:

```
✅ Brevo email service configured successfully
```

### Step 4: Test Again

Submit the quote form again. Now emails should send through Brevo API.

---

## Verification Checklist

- [ ] Backend starts without errors
- [ ] Backend shows either "configured successfully" or "not properly configured" message
- [ ] Quote form submits successfully
- [ ] Frontend shows success message
- [ ] Quote appears in database
- [ ] Backend console shows email logs (in dev mode) or "Email sent successfully" (production)
- [ ] No 500 errors in response

---

## If Still Having Issues

### Backend not starting?

```powershell
# Check if port 5000 is already in use
netstat -ano | findstr :5000

# Check Node version
node --version

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
npm start
```

### Email key still not working?

- Make sure you copied the full key starting with `xkeysib-`
- No extra spaces before/after the key
- Save `.env` file
- Restart backend server
- Check backend console for "✅ Brevo email service configured successfully"

### Quote form still failing?

- Clear browser cache and cookies
- Try different browser (Firefox, Chrome, Edge)
- Check browser console for error messages
- Check backend console for error logs

---

## Files Updated

✅ `utils/brevoEmailService.js` - Graceful fallback implemented
📄 `BREVO_GRACEFUL_FALLBACK_FIX.md` - Technical documentation

---

## Summary

**Before:** Quote submission crashed endpoint due to invalid API key
**After:** Quote submission works, emails logged to console until real key added
**Status:** ✅ Ready for testing

Start your backend and test the quote form now!
