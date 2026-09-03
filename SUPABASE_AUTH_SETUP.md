# Supabase Authentication Setup Guide

This guide explains what needs to be enabled in your Supabase dashboard to make authentication work properly for MyElin.

## 🔐 Current Authentication Features

Your app already has these features built:
- ✅ **User Registration** (`/signup`)
- ✅ **User Login** (`/login`)
- ✅ **Forgot Password** (`/forgot-password`)
- ✅ **Reset Password** (`/reset-password`)
- ✅ **Email Verification Support**
- ✅ **Session Refresh** (for long simulation runs)

## 📋 Supabase Dashboard Configuration

### 1. **Enable Email Confirmation (Email Verification)**

**Location:** Supabase Dashboard → Authentication → Providers → Email

**Settings to Configure:**
- ✅ **Enable Email Confirmation**: Turn this ON
  - This will send a verification email when users sign up
  - Users must click the link in the email before they can log in
  
**What happens:**
- When a user signs up, Supabase sends them an email with a confirmation link
- Until they click it, their account exists but they cannot log in
- After clicking, they can log in normally

**⚠️ Important:** If you enable this, existing users who signed up without confirmation will need to verify their email or you'll need to manually mark them as confirmed in the database.

---

### 2. **Configure Email Templates**

**Location:** Supabase Dashboard → Authentication → Email Templates

You need to customize these templates:

#### **A. Confirmation Email (for signup verification)**
- **Template Name:** "Confirm signup"
- **Purpose:** Sent when a user registers
- **Default Subject:** "Confirm Your Signup"
- **Required Changes:**
  - Update the `{{ .ConfirmationURL }}` link to point to your frontend
  - Customize the email design/branding to match MyElin
  - Make sure the button/link is prominent

**Example template:**
```html
<h2>Welcome to Myelin!</h2>
<p>Thanks for signing up. Please confirm your email address by clicking the button below:</p>
<a href="{{ .ConfirmationURL }}" style="...">Confirm Email</a>
<p>If you didn't sign up for Myelin, you can ignore this email.</p>
```

#### **B. Password Recovery Email (for forgot password)**
- **Template Name:** "Reset Password" 
- **Purpose:** Sent when user requests password reset
- **Default Subject:** "Reset Your Password"
- **Required Changes:**
  - Update the `{{ .ConfirmationURL }}` link 
  - Customize branding
  - Include expiration time (default: 1 hour)

**Example template:**
```html
<h2>Reset Your Myelin Password</h2>
<p>We received a request to reset your password. Click the button below to choose a new one:</p>
<a href="{{ .ConfirmationURL }}" style="...">Reset Password</a>
<p>This link expires in 1 hour.</p>
<p>If you didn't request a password reset, you can ignore this email.</p>
```

---

### 3. **Configure Redirect URLs**

**Location:** Supabase Dashboard → Authentication → URL Configuration

**Settings to Configure:**

#### **A. Site URL**
- Set this to your **primary production domain**
- Example: `https://www.myelinworks.com`
- ⚠️ **Do NOT use wildcards** (like `https://*.myelinworks.com`) - it causes the reset link to 404

#### **B. Redirect URLs (Allow List)**
Add ALL the URLs where auth callbacks should work:

```
https://www.myelinworks.com/reset-password
https://www.myelinworks.com/signup
https://myelinworks.com/reset-password
https://myelinworks.com/signup
http://localhost:3000/reset-password
http://localhost:3000/signup
```

**For each domain you use (production, staging, dev), add:**
- `/reset-password` - Where password reset links land
- `/signup` - Where email confirmation links land (if using email verification)

**Why this matters:**
- When Supabase sends a password reset email, it includes a link back to your app
- That link goes to `/reset-password` with a token in the URL
- If the URL isn't in this allow-list, Supabase redirects to the Site URL instead, causing a 404

---

### 4. **Auth Flow Type**

**Location:** Supabase Dashboard → Authentication → Settings → Auth Flow

**Required Setting:**
- ✅ **Set to "Implicit" flow** (NOT "PKCE")

**Why:** Your reset password page (`ResetPassword.tsx`) reads the token from the URL fragment (`#access_token=...`). PKCE flow uses a different format that requires a Supabase client library to exchange a code for a token. The implicit flow works with your current implementation.

---

### 5. **Email Rate Limiting**

**Location:** Supabase Dashboard → Authentication → Rate Limits

**Default Settings (these are usually fine):**
- Signup: 4 requests per hour per email
- Password reset: 4 requests per hour per email
- Login attempts: Many more (per IP)

**⚠️ If you see "Too many attempts" errors:**
- Users will see: "Too many attempts right now. Wait a minute and try again"
- This is by design to prevent abuse
- You can adjust these limits if needed for testing

---

### 6. **SMTP Email Provider (Optional but Recommended)**

**Location:** Supabase Dashboard → Project Settings → Auth → SMTP Settings

**Why configure this:**
- By default, Supabase uses their own email service
- It works but may have delivery issues or end up in spam
- For production, use your own SMTP provider (SendGrid, AWS SES, Mailgun, etc.)

**Settings to configure:**
- SMTP Host
- SMTP Port (usually 587 for TLS)
- Username
- Password
- Sender email (must match your domain)
- Sender name (e.g., "Myelin Team")

**Popular SMTP providers:**
- **SendGrid**: Free tier available, easy setup
- **AWS SES**: Very reliable, pay-as-you-go
- **Mailgun**: Good deliverability
- **Resend**: Modern, developer-friendly

---

## 🧪 Testing the Setup

### Test Signup with Email Verification:

1. **If email confirmation is ENABLED:**
   ```
   1. Go to /signup
   2. Enter email and password
   3. Submit form
   4. Check your email for confirmation link
   5. Click the link → should land on /signup or /login
   6. Try to log in → should work now
   ```

2. **If email confirmation is DISABLED:**
   ```
   1. Go to /signup
   2. Enter email and password
   3. Submit form → should immediately log you in
   4. Redirected to /simulations
   ```

### Test Password Reset:

1. **Trigger password reset:**
   ```
   1. Go to /login
   2. Click "Forgot password?"
   3. Enter your email
   4. Click "Send reset link"
   5. Check your email
   ```

2. **Complete password reset:**
   ```
   1. Click the link in the email
   2. Should land on /reset-password
   3. Enter new password (8+ characters)
   4. Confirm password
   5. Click "Update password"
   6. Should redirect to /login
   7. Log in with new password
   ```

### Test Login:

```
1. Go to /login
2. Enter email and password
3. Click "Log in"
4. Should redirect to /simulations
```

---

## 🐛 Common Issues and Fixes

### Issue: "Email confirmation required" error on login

**Cause:** Email confirmation is enabled but user hasn't verified
**Fix:** 
- Option 1: User clicks the confirmation link in their email
- Option 2: Manually confirm in Supabase Dashboard → Authentication → Users → Click user → "Confirm Email"

### Issue: Password reset link goes to 404

**Cause:** `/reset-password` URL not in Redirect URLs allow-list
**Fix:** 
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your domain's `/reset-password` URL to "Redirect URLs"
3. Make sure Site URL is a real URL (not wildcard)

### Issue: "This reset link is in a format this page cannot complete"

**Cause:** Auth flow is set to PKCE instead of Implicit
**Fix:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Change "Auth Flow" to "Implicit"

### Issue: Emails not arriving

**Causes:**
- Supabase's default email service is unreliable
- Email ended up in spam
- Rate limit hit (4 per hour default)

**Fixes:**
1. Check spam folder
2. Wait an hour if rate limit hit
3. Configure custom SMTP provider (recommended for production)

### Issue: "Already registered" error but user can't log in

**Cause:** User registered but never confirmed email (if confirmation is enabled)
**Fix:**
1. Check Supabase Dashboard → Authentication → Users
2. Look for user's "Email Confirmed" status
3. Either:
   - Resend confirmation email (click "Send Email" button)
   - Manually mark as confirmed (click "Confirm Email")

---

## 📧 Recommended Email Confirmation Strategy

### For Development:
- ✅ **Disable email confirmation** for faster testing
- Users can sign up and immediately log in

### For Production:
- ✅ **Enable email confirmation** to verify real email addresses
- Prevents fake accounts
- Ensures you can contact users
- Better security

---

## 🔄 Session Management

Your app already handles:
- ✅ **Session expiry**: Tokens expire after ~1 hour
- ✅ **Auto-refresh**: Frontend automatically refreshes tokens during long simulations
- ✅ **Logout**: Clears session properly

No additional Supabase configuration needed for this!

---

## 📝 Environment Variables Required

Make sure these are set in your `.env` files:

### Backend (`backend/.env`):
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...  # For server-side operations
FRONTEND_URL=https://www.myelinworks.com
```

### Frontend (`frontend/.env`):
```bash
NEXT_PUBLIC_API_URL=https://api.myelinworks.com
```

---

## ✅ Quick Checklist

Before going to production, verify:

- [ ] Email confirmation enabled (if desired)
- [ ] Email templates customized with MyElin branding
- [ ] Site URL set to production domain (no wildcards)
- [ ] `/reset-password` added to Redirect URLs for all domains
- [ ] `/signup` added to Redirect URLs (if using email confirmation)
- [ ] Auth Flow set to "Implicit"
- [ ] SMTP provider configured (recommended)
- [ ] Test signup → confirmation → login flow
- [ ] Test forgot password → reset → login flow
- [ ] Test session refresh during long simulation runs

---

## 🆘 Need Help?

If something isn't working:

1. **Check browser console** for error messages
2. **Check backend logs** for detailed Supabase API errors
3. **Check Supabase Dashboard → Logs** to see what Supabase received
4. **Verify environment variables** are set correctly
5. **Test in incognito mode** to rule out cached sessions

Common error messages and what they mean:
- `"Email not confirmed"` → User needs to click confirmation link
- `"Invalid credentials"` → Wrong email/password OR email not confirmed
- `"Too many attempts"` → Rate limit hit, wait an hour
- `"Token expired"` → Reset link is >1 hour old, request new one
- `"Redirect URL not allowed"` → Add URL to Redirect URLs allow-list
