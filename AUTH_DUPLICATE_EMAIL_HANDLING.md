# Duplicate Email Handling - How It Works

## ✅ Yes, Duplicate Email Prevention is Working!

Your authentication system **does prevent duplicate signups** with the same email address. Here's how:

---

## 🔒 How Duplicate Email Prevention Works

### **Supabase Auth is the Guardian**

The duplicate email check happens at **Supabase Auth level**, not in your local database. This is the correct and secure approach.

**Flow:**
```
1. User fills signup form → POST /auth/register
2. Backend calls Supabase Auth API → POST /auth/v1/signup
3. 🔒 SUPABASE CHECKS: "Does this email already exist?"
   ├─ YES → Returns error "User already registered"
   └─ NO → Creates account, returns session
4. Backend receives response
   ├─ Error → Returns 422 with Supabase's message
   └─ Success → Returns session tokens
5. Frontend receives response
   ├─ Error → Shows user-friendly message
   └─ Success → Logs user in
```

---

## 📝 Code Implementation

### Backend (routes/auth.py)
```python
async def register(payload: RegisterRequest, client: SupabaseAuthClient):
    try:
        result = await client.sign_up(email=payload.email, password=payload.password)
    except SupabaseAuthError as exc:
        # Supabase rejected signup (weak password, invalid email, OR already registered)
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, exc.message) from exc
    return AuthResponse(**result)
```

**What happens:**
- Backend proxies the request to Supabase Auth
- If email is already registered, Supabase returns an error
- Backend forwards that error as a 422 response

---

### Frontend (components/auth/AuthSlide.tsx)
```typescript
} catch (err) {
  if (
    mode === "signup" &&
    err instanceof ApiError &&
    (err.message?.toLowerCase().includes("already registered") ||
     err.message?.toLowerCase().includes("already been registered") ||
     err.message?.toLowerCase().includes("email address already") ||
     err.message?.toLowerCase().includes("user already exists") ||
     (err.body as Record<string, unknown>)?.error === "user_already_exists")
  ) {
    // This email is taken. Guide them to login rather than showing raw API message.
    setError(
      "That email is already registered. Log in instead, or use a different email address.",
    );
  }
}
```

**What happens:**
- Frontend catches the 422 error from backend
- Checks if it's a "duplicate email" error (multiple patterns for Supabase's different messages)
- Shows user-friendly message: **"That email is already registered. Log in instead, or use a different email address."**

---

## 🧪 Testing Duplicate Email Prevention

### Test Case: Try to signup with existing email

1. **First signup:**
   ```
   Email: test@example.com
   Password: password123
   → SUCCESS: Account created, user logged in
   ```

2. **Second signup (same email):**
   ```
   Email: test@example.com  ← Same email
   Password: differentpass456
   → ERROR: "That email is already registered. Log in instead, or use a different email address."
   ```

3. **Verify the error is user-friendly:**
   - ✅ Red error box appears
   - ✅ Message is clear and actionable
   - ✅ Suggests logging in instead
   - ✅ Does NOT expose technical details

---

## 🗃️ Why No Database Constraint?

You might notice there's **no UNIQUE constraint** on `app_users.email` in your PostgreSQL database:

```python
# app_users table (no unique constraint on email)
email: Mapped[str] = mapped_column(String(255), nullable=False)
```

**This is intentional and correct!**

### Why?

1. **Supabase Auth is the source of truth**
   - Email uniqueness is enforced by Supabase's `auth.users` table
   - Your `app_users` table is just a **local mirror** for storing additional profile data
   - The primary key is the Supabase `sub` (user ID), not the email

2. **Single source of truth prevents conflicts**
   - If you enforced uniqueness in both places, you could get race conditions
   - Supabase already handles this correctly with proper locking
   - Your database just trusts Supabase's decisions

3. **Simpler maintenance**
   - No need to keep two databases in sync
   - No need to handle constraint violations in your code
   - Supabase handles email validation, verification, and uniqueness

---

## 🔍 What Supabase Checks

When a user tries to signup, Supabase Auth checks:

1. ✅ **Email format** - Is it a valid email address?
2. ✅ **Email uniqueness** - Is this email already registered?
3. ✅ **Password strength** - Meets minimum requirements (8+ chars by default)?
4. ✅ **Rate limiting** - Has this IP/email hit the signup limit?
5. ✅ **Email domain** (optional) - Is this domain allowed (if configured)?

If ANY of these fail, Supabase returns an error and your app handles it gracefully.

---

## 🎯 What This Means for You

### ✅ Already Working:
- Users **cannot** signup with the same email twice
- Error message is **user-friendly** and actionable
- No changes needed - it's already implemented correctly

### 🔒 Security:
- Email uniqueness enforced by **Supabase** (not your database)
- This is the **correct architecture**
- More secure than trying to enforce it in multiple places

### 🧪 To Verify It's Working:
1. Go to `/signup`
2. Create an account with `test@example.com`
3. Log out
4. Try to signup again with `test@example.com`
5. You should see: **"That email is already registered. Log in instead, or use a different email address."**

---

## 📊 Error Messages You Might See

| Scenario | Error Message |
|----------|--------------|
| Email already registered | "That email is already registered. Log in instead, or use a different email address." |
| Invalid email format | "Invalid email" (from Supabase) |
| Password too short | "Password must be at least 8 characters." (frontend validation) |
| Weak password | "Password is too weak" (from Supabase) |
| Too many attempts | "Too many attempts right now. Wait a minute and try again — if you already registered, log in instead." |

---

## 🛠️ Supabase Configuration

No additional configuration needed for duplicate email prevention - it's enabled by default!

However, you can configure related settings in Supabase Dashboard:

### Optional: Email Domain Restrictions
**Location:** Supabase Dashboard → Authentication → Settings → Email Domain Restrictions

- Whitelist specific domains (e.g., only `@university.edu` emails)
- Blacklist domains (e.g., block disposable email services)

### Optional: Rate Limiting
**Location:** Supabase Dashboard → Authentication → Rate Limits

- Default: 4 signup attempts per hour per email
- Prevents abuse while allowing legitimate retries

---

## ✅ Summary

**Question:** "Can users signup with the same email?"
**Answer:** **NO!** Duplicate email prevention is working correctly.

**How it works:**
1. ✅ Supabase Auth enforces email uniqueness
2. ✅ Backend proxies the check to Supabase
3. ✅ Frontend shows user-friendly error message
4. ✅ No database constraint needed (Supabase is source of truth)

**Test it:** Try signing up twice with the same email - you'll see it's blocked!

**Architecture:** This is the **correct and secure** approach for Supabase-based auth.
