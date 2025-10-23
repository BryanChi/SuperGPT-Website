// SuperGPT Backend Server
// Simple Node.js server for payment processing and license management

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage (in production, use a database)
const licenses = new Map();
const payments = new Map();
let lastSentEmail = null; // For previewing the most recent email

// Initialize with demo data
licenses.set('SGPT-DEMO-2024-DEMO', {
    key: 'SGPT-DEMO-2024-DEMO',
    email: 'demo@example.com',
    purchaseDate: new Date().toISOString(),
    status: 'active',
    product: 'SuperGPT',
    type: 'demo'
});

licenses.set('SGPT-TEST-2024-TEST', {
    key: 'SGPT-TEST-2024-TEST',
    email: 'test@example.com',
    purchaseDate: new Date().toISOString(),
    status: 'active',
    product: 'SuperGPT',
    type: 'test'
});

// Utility functions
function generateLicenseKey() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const checksum = generateChecksum(timestamp + randomPart);
    
    return `SGPT-${timestamp.toUpperCase()}-${randomPart.toUpperCase()}-${checksum}`;
}

function generateChecksum(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36).toUpperCase().substring(0, 4);
}

function validateLicenseKey(licenseKey) {
    const pattern = /^SGPT-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]{4}$/;
    return pattern.test(licenseKey);
}

// API Routes

// Process payment endpoint
app.post('/api/process-payment', async (req, res) => {
    try {
        const { transactionId, customerEmail, amount, currency, paypalDetails } = req.body;
        
        // Validate required fields
        if (!transactionId || !customerEmail) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: transactionId and customerEmail'
            });
        }
        
        // Check if payment already processed
        if (payments.has(transactionId)) {
            return res.status(400).json({
                success: false,
                error: 'Payment already processed'
            });
        }
        
        // Verify PayPal payment (basic validation)
        if (paypalDetails && paypalDetails.status === 'COMPLETED') {
            console.log('PayPal payment verified:', paypalDetails.id);
        }
        
        // Generate license key
        const licenseKey = generateLicenseKey();
        
        // Create license record
        const license = {
            key: licenseKey,
            email: customerEmail,
            purchaseDate: new Date().toISOString(),
            status: 'active',
            product: config.product.name,
            transactionId: transactionId,
            amount: amount || config.product.price,
            currency: currency || config.product.currency
        };
        
        // Store license and payment
        licenses.set(licenseKey, license);
        payments.set(transactionId, {
            transactionId,
            customerEmail,
            amount: amount || config.product.price,
            currency: currency || config.product.currency,
            status: 'completed',
            processedAt: new Date().toISOString(),
            licenseKey: licenseKey,
            paypalDetails: paypalDetails
        });
        
        // Log the transaction
        console.log(`Payment processed: ${transactionId} -> License: ${licenseKey}`);
        console.log(`Customer: ${customerEmail}, Amount: ${amount || config.product.price} ${currency || config.product.currency}`);
        
        res.json({
            success: true,
            licenseKey: licenseKey,
            license: license
        });
        
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Verify license endpoint
app.post('/api/verify-license', async (req, res) => {
    try {
        const { licenseKey, email } = req.body;
        
        // Validate license key format
        if (!validateLicenseKey(licenseKey)) {
            return res.status(400).json({
                valid: false,
                message: 'Invalid license key format'
            });
        }
        
        const license = licenses.get(licenseKey);
        
        if (!license) {
            return res.json({
                valid: false,
                message: 'License key not found'
            });
        }
        
        // Check if license is active
        if (license.status !== 'active') {
            return res.json({
                valid: false,
                message: 'License is not active'
            });
        }
        
        // Optional email verification
        if (email && license.email !== email) {
            return res.json({
                valid: false,
                message: 'Email does not match license record'
            });
        }
        
        res.json({
            valid: true,
            message: 'License verified successfully',
            license: license
        });
        
    } catch (error) {
        console.error('License verification error:', error);
        res.status(500).json({
            valid: false,
            message: 'Verification error'
        });
    }
});

// PayPal webhook endpoint (for production)
app.post('/api/paypal-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        const webhookData = JSON.parse(req.body);
        
        console.log('PayPal webhook received:', webhookData.event_type);
        
        // Handle different webhook events
        if (webhookData.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const paymentData = webhookData.resource;
            console.log('Payment completed via webhook:', paymentData.id);
            
            // Process the payment
            // This would typically involve verifying the webhook signature
            // and processing the payment data
            
            res.status(200).send('OK');
        } else {
            console.log('Unhandled webhook event:', webhookData.event_type);
            res.status(200).send('OK');
        }
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Error');
    }
});

// Send license email endpoint
app.post('/api/send-license-email', async (req, res) => {
    try {
        const { email, licenseKey, productName } = req.body;

        const subject = `${productName || 'SuperGPT'} License Key`;
        const textBody = `
Thank you for your purchase!

Product: ${productName || 'SuperGPT'}
License Key: ${licenseKey}

How to use your license:
1) Install the extension
2) Open the Verify page (http://localhost:${PORT}/verify)
3) Paste your license key and verify

If you didn't make this purchase, contact support.
`;
        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${subject}</title>
  <style>
    body{font-family: Arial, sans-serif;color:#111;}
    .card{max-width:560px;margin:20px auto;border:1px solid #e5e7eb;border-radius:12px;padding:24px}
    .title{font-size:18px;font-weight:700;margin:0 0 12px}
    .muted{color:#6b7280}
    .license{font-family:monospace;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin:12px 0}
    .btn{display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px}
  </style>
  </head>
  <body>
    <div class="card">
      <h1 class="title">${productName || 'SuperGPT'} License Key</h1>
      <p class="muted">Thanks for your purchase! Here is your license key:</p>
      <div class="license">${licenseKey}</div>
      <p>Next steps:</p>
      <ol>
        <li>Install the extension</li>
        <li>Open the Verify page</li>
        <li>Paste your license key and verify</li>
      </ol>
      <p>
        <a class="btn" href="http://localhost:${PORT}/verify" target="_blank">Verify License</a>
      </p>
      <p class="muted">If you didn't make this purchase, contact support.</p>
    </div>
  </body>
</html>`;

        // Log to console (simulated send)
        console.log(`Sending license email to ${email} with key: ${licenseKey}`);

        // Store for preview
        lastSentEmail = {
            to: email,
            subject,
            text: textBody.trim(),
            html: htmlBody,
            sentAt: new Date().toISOString()
        };

        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 250));

        res.json({ success: true, message: 'License email sent successfully', preview: lastSentEmail });
        
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send email'
        });
    }
});

// Email preview endpoint (for testing)
app.get('/api/admin/last-email', (req, res) => {
    if (!lastSentEmail) {
        return res.status(404).json({ success: false, message: 'No email sent yet' });
    }
    res.json({ success: true, email: lastSentEmail });
});

// HTML preview for last email
app.get('/email-preview', (req, res) => {
    if (!lastSentEmail) {
        return res.status(404).send('<p>No email sent yet.</p>');
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(lastSentEmail.html);
});

// Get license info endpoint
app.get('/api/license/:key', async (req, res) => {
    try {
        const licenseKey = req.params.key;
        const license = licenses.get(licenseKey);
        
        if (!license) {
            return res.status(404).json({
                success: false,
                message: 'License not found'
            });
        }
        
        res.json({
            success: true,
            license: license
        });
        
    } catch (error) {
        console.error('Get license error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get payment info endpoint
app.get('/api/payment/:transactionId', async (req, res) => {
    try {
        const transactionId = req.params.transactionId;
        const payment = payments.get(transactionId);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        res.json({
            success: true,
            payment: payment
        });
        
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Admin endpoints (in production, add authentication)

// List all licenses
app.get('/api/admin/licenses', async (req, res) => {
    try {
        const licensesList = Array.from(licenses.values());
        res.json({
            success: true,
            licenses: licensesList
        });
    } catch (error) {
        console.error('List licenses error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// List all payments
app.get('/api/admin/payments', async (req, res) => {
    try {
        const paymentsList = Array.from(payments.values());
        res.json({
            success: true,
            payments: paymentsList
        });
    } catch (error) {
        console.error('List payments error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'payment.html'));
});

app.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'verify.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`SuperGPT server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the website`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
