# PayPal Sandbox Setup Guide

## 🚨 CRITICAL ISSUE: You're Using LIVE PayPal Mode!

**Your PayPal integration is currently in LIVE mode, which is why:**
- Real phone verification is required
- Real credit cards are being processed
- Sandbox accounts don't work
- You're getting real PayPal errors

## ✅ SOLUTION: Switch to Sandbox Mode

### Step 1: Get Sandbox Client ID

1. **Go to**: [PayPal Developer Dashboard](https://developer.paypal.com/developer/applications/)
2. **Log in** with your PayPal account
3. **Find your app** (the one with Client ID: `AVVzspvoyrBZYv6BhuaPGPNTECuA0Vc0KLzfrcdAiFyv72yJQIqv7loska0lLEYgYfYd1F1a9fInrTF7`)
4. **Click on the app** to open details
5. **Look for "Sandbox" section** or "Test" mode
6. **Get the Sandbox Client ID** (it will be different from the live one)

### Step 2: Update Your Code

Replace the Client ID in `payment.html` line 13:

```html
<!-- CURRENT (LIVE MODE) -->
<script src="https://www.paypal.com/sdk/js?client-id=AVVzspvoyrBZYv6BhuaPGPNTECuA0Vc0KLzfrcdAiFyv72yJQIqv7loska0lLEYgYfYd1F1a9fInrTF7&currency=USD&intent=capture"></script>

<!-- CHANGE TO (SANDBOX MODE) -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_SANDBOX_CLIENT_ID&currency=USD&intent=capture"></script>
```

### Step 3: Create Sandbox Accounts

1. **Go to**: [PayPal Developer Dashboard](https://developer.paypal.com/developer/accounts/)
2. **Click "Create Account"**
3. **Select "Personal"** (for buyer testing)
4. **Click "Create"**
5. **Copy the generated email/password**

### Step 4: Test Sandbox Mode

1. **Use the sandbox account** credentials
2. **No phone verification** required
3. **No real money** processed
4. **Test cards work** properly

## 🔍 How to Identify Sandbox vs Live

### Live Mode (Current - PROBLEM):
- Real phone verification
- Real credit cards required
- Real money processing
- Sandbox accounts don't work
- URL: `paypal.com`

### Sandbox Mode (What You Need):
- No phone verification
- Test credit cards work
- No real money
- Sandbox accounts work
- URL: `sandbox.paypal.com`

## 🧪 Test Cards for Sandbox Mode

Once in sandbox mode, these cards will work:

### Visa Test Card
```
Card Number: 4032031924042807
Expiry: 12/2025
CVV: 123
Name: Test User
```

### Mastercard Test Card
```
Card Number: 5555555555554444
Expiry: 12/2025
CVV: 123
Name: Test User
```

## 🚀 Quick Fix: Use Demo Mode

Until you get sandbox working, use the **Demo Mode** button:

1. **Visit**: `http://localhost:3000/payment`
2. **Click**: "Test Payment (Demo Mode)" button
3. **Confirm**: the dialog
4. **Receive**: your license key
5. **Test**: license verification

## 📋 Checklist

- [ ] Get sandbox Client ID from PayPal Developer Dashboard
- [ ] Update `payment.html` with sandbox Client ID
- [ ] Create sandbox account
- [ ] Test payment with sandbox account
- [ ] Verify no phone verification required
- [ ] Confirm test cards work

## 🔗 Useful Links

- [PayPal Developer Dashboard](https://developer.paypal.com/developer/applications/)
- [Sandbox Accounts](https://developer.paypal.com/developer/accounts/)
- [Test Card Numbers](https://developer.paypal.com/docs/classic/paypal-payments-standard/integration-guide/testing/)

## ⚠️ Important Notes

1. **Sandbox Client ID** is different from Live Client ID
2. **Sandbox accounts** are separate from live accounts
3. **Test cards** only work in sandbox mode
4. **No real money** is processed in sandbox
5. **Phone verification** is not required in sandbox

---

**URGENT**: Switch to sandbox mode immediately to avoid real money processing!
