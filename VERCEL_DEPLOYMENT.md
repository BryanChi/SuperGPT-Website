# Vercel Deployment Guide for SuperGPT

## ✅ Configuration Complete!

Your SuperGPT website is now configured to automatically send license keys to your Vercel backend API when purchases succeed.

## 🚀 Deployment Steps

### 1. Deploy Your Backend to Vercel

**Option A: Deploy all files together**
```bash
# In your project directory
vercel
```

**Option B: Create vercel.json**
Create a `vercel.json` file to configure routing:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 2. Set Environment Variables in Vercel

Go to your Vercel project settings and add:

**Required:**
- `NODE_ENV`: `production`
- `PORT`: `3000` (Vercel sets this automatically)

**Optional (for production PayPal):**
- `PAYPAL_CLIENT_ID`: Your production PayPal Client ID
- `PAYPAL_CLIENT_SECRET`: Your production PayPal Secret
- `SENDGRID_API_KEY`: If using SendGrid for emails

### 3. Update PayPal Configuration

**For Production:**
1. Change `config.js` PayPal mode to `'live'`
2. Replace sandbox Client ID with production Client ID
3. Update `payment.html` PayPal SDK script with production Client ID

**For Testing (keep sandbox):**
- Keep current sandbox configuration
- Test with sandbox accounts only

## 📝 How It Works

### When a Purchase Succeeds:

1. **Payment Processing** (`payment-processor.js`)
   - PayPal sends payment confirmation
   - `processSuccessfulPayment()` is called
   - License key is generated

2. **Backend API Call** (automatic)
   ```javascript
   POST ${API_URL}/api/process-payment
   {
     transactionId: "...",
     licenseKey: "SGPT-...",
     customerEmail: "buyer@example.com",
     amount: "9.90",
     currency: "USD",
     status: "completed"
   }
   ```

3. **Email Sending** (automatic)
   ```javascript
   POST ${API_URL}/api/send-license-email
   {
     email: "buyer@example.com",
     licenseKey: "SGPT-...",
     productName: "SuperGPT"
   }
   ```

4. **License Storage** (automatic)
   - License is stored in backend
   - Can be verified at `/api/verify-license`

## 🔍 Testing Email Preview

After deployment, view the last sent email at:
- **HTML Preview**: `https://your-site.vercel.app/email-preview`
- **JSON Data**: `https://your-site.vercel.app/api/admin/last-email`

## ✅ Verification Endpoints

All API calls automatically use your Vercel domain:

| Endpoint | Purpose |
|----------|---------|
| `/api/process-payment` | Store payment and generate license |
| `/api/send-license-email` | Send license email to buyer |
| `/api/verify-license` | Verify license key |
| `/api/license/:key` | Get license information |
| `/email-preview` | Preview last sent email |

## 🌐 Deployment Checklist

- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Update PayPal Client ID for production
- [ ] Test payment flow
- [ ] Verify email preview
- [ ] Test license verification
- [ ] Update extension download link

## 🔧 Troubleshooting

### Payments Not Reaching Backend
- Check browser console for errors
- Verify API_URL is correct (should be your Vercel domain)
- Check Vercel function logs

### Email Not Sending
- Check `/email-preview` to see if email was generated
- Verify SendGrid API key if using production
- Check Vercel logs for errors

### License Verification Failing
- Check that license was stored in backend
- Verify email matches purchase email
- Check API endpoint logs

## 📊 Current Configuration

**API URL**: Uses `window.location.origin` (auto-detects domain)
- Local: `http://localhost:3000`
- Vercel: `https://your-site.vercel.app`

**Backend Calls**:
- All `/api/*` endpoints use current domain
- No hardcoded URLs
- Works seamlessly across environments

## 🎉 Ready to Deploy!

Your SuperGPT website is now configured to automatically send license keys to your Vercel backend. Simply deploy and test!
