# PayPal Sandbox Login Fix

## 🚨 Common Issue: "Account or password incorrect"

This happens because sandbox accounts need to be **activated** before you can use them.

## ✅ Solution: Activate Your Sandbox Account

### Step 1: Check Account Status
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/developer/accounts/)
2. Find your sandbox account
3. Check if it shows **"Active"** or **"Pending"**

### Step 2: Activate the Account
1. Click on your sandbox account
2. Look for **"Activate"** or **"Confirm"** button
3. Click it to activate the account
4. Wait for status to change to **"Active"**

### Step 3: Reset Password (if needed)
1. In the account details, click **"Reset Password"**
2. PayPal will generate a new password
3. **Copy the new password** (you won't see it again)

### Step 4: Test Login
1. Use the **exact email** from the account
2. Use the **new password** (not the old one)
3. Make sure you're logging into **sandbox.paypal.com** (not live PayPal)

## 🔧 Alternative: Use Test Cards Instead

If you're still having issues, use test credit cards:

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

## 🐛 Troubleshooting Steps

### 1. Clear Browser Data
- Clear cookies and cache
- Try incognito/private mode
- Disable browser extensions

### 2. Check URL
- Make sure you're on **sandbox.paypal.com**
- Not **paypal.com** (live site)

### 3. Verify Credentials
- Copy/paste email (no typos)
- Use the **new password** from reset
- Check for extra spaces

### 4. Try Different Browser
- Chrome, Firefox, Safari
- Mobile browser
- Different device

## 📋 Step-by-Step Activation

1. **Go to**: https://developer.paypal.com/developer/accounts/
2. **Find your account** in the list
3. **Click on the account** to open details
4. **Look for "Activate" button**
5. **Click "Activate"**
6. **Wait for status to change**
7. **Reset password** if needed
8. **Copy new password**
9. **Test login** with new credentials

## 🔍 What to Look For

### In Developer Dashboard:
- Account status: **"Active"** ✅
- Account status: **"Pending"** ❌ (needs activation)

### In PayPal Login:
- URL: **sandbox.paypal.com** ✅
- URL: **paypal.com** ❌ (wrong site)

## 💡 Pro Tips

1. **Bookmark** your sandbox credentials
2. **Save password** in password manager
3. **Test immediately** after activation
4. **Use test cards** as backup
5. **Check server logs** for detailed errors

## 🆘 Still Having Issues?

If you're still unable to login:

1. **Create a new sandbox account**
2. **Activate it immediately**
3. **Use test cards** instead
4. **Check server logs** for error details
5. **Try different browser/device**

---

**Remember**: Sandbox accounts are separate from your live PayPal account and need activation!
