// Simple Backend API for SuperGPT Payment Processing and License Management
// This is a basic implementation for demonstration purposes
// In production, you would use a proper backend framework like Express.js, Django, etc.

class SuperGPTAPI {
    constructor() {
        this.baseUrl = '/api';
        this.licenses = new Map(); // In-memory storage for demo
        this.payments = new Map(); // In-memory storage for demo
        
        // Initialize with some demo data
        this.initializeDemoData();
    }
    
    initializeDemoData() {
        // Add some demo licenses
        this.licenses.set('SGPT-DEMO-2024-DEMO', {
            key: 'SGPT-DEMO-2024-DEMO',
            email: 'demo@example.com',
            purchaseDate: new Date().toISOString(),
            status: 'active',
            product: 'SuperGPT',
            type: 'demo'
        });
        
        this.licenses.set('SGPT-TEST-2024-TEST', {
            key: 'SGPT-TEST-2024-TEST',
            email: 'test@example.com',
            purchaseDate: new Date().toISOString(),
            status: 'active',
            product: 'SuperGPT',
            type: 'test'
        });
    }
    
    // Process payment and generate license
    async processPayment(paymentData) {
        try {
            // Validate payment data
            if (!paymentData.transactionId || !paymentData.customerEmail) {
                throw new Error('Invalid payment data');
            }
            
            // Generate license key
            const licenseKey = this.generateLicenseKey();
            
            // Create license record
            const license = {
                key: licenseKey,
                email: paymentData.customerEmail,
                purchaseDate: new Date().toISOString(),
                status: 'active',
                product: 'SuperGPT',
                transactionId: paymentData.transactionId,
                amount: paymentData.amount,
                currency: paymentData.currency
            };
            
            // Store license
            this.licenses.set(licenseKey, license);
            
            // Store payment record
            this.payments.set(paymentData.transactionId, {
                ...paymentData,
                processedAt: new Date().toISOString(),
                licenseKey: licenseKey
            });
            
            // Send email (simulated)
            await this.sendLicenseEmail(paymentData.customerEmail, licenseKey);
            
            return {
                success: true,
                licenseKey: licenseKey,
                license: license
            };
            
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Verify license key
    async verifyLicense(licenseKey, email = null) {
        try {
            const license = this.licenses.get(licenseKey);
            
            if (!license) {
                return {
                    valid: false,
                    message: 'License key not found'
                };
            }
            
            // Check if license is active
            if (license.status !== 'active') {
                return {
                    valid: false,
                    message: 'License is not active'
                };
            }
            
            // Optional email verification
            if (email && license.email !== email) {
                return {
                    valid: false,
                    message: 'Email does not match license record'
                };
            }
            
            return {
                valid: true,
                message: 'License verified successfully',
                license: license
            };
            
        } catch (error) {
            console.error('License verification error:', error);
            return {
                valid: false,
                message: 'Verification error'
            };
        }
    }
    
    // Generate unique license key
    generateLicenseKey() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        const checksum = this.generateChecksum(timestamp + randomPart);
        
        return `SGPT-${timestamp.toUpperCase()}-${randomPart.toUpperCase()}-${checksum}`;
    }
    
    // Generate checksum for license key
    generateChecksum(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36).toUpperCase().substring(0, 4);
    }
    
    // Send license email (simulated)
    async sendLicenseEmail(email, licenseKey) {
        // In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
        console.log(`Sending license email to ${email} with key: ${licenseKey}`);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true,
            message: 'License email sent successfully'
        };
    }
    
    // Get license information
    async getLicenseInfo(licenseKey) {
        const license = this.licenses.get(licenseKey);
        
        if (!license) {
            return {
                success: false,
                message: 'License not found'
            };
        }
        
        return {
            success: true,
            license: license
        };
    }
    
    // Get payment information
    async getPaymentInfo(transactionId) {
        const payment = this.payments.get(transactionId);
        
        if (!payment) {
            return {
                success: false,
                message: 'Payment not found'
            };
        }
        
        return {
            success: true,
            payment: payment
        };
    }
    
    // List all licenses (admin function)
    async listLicenses() {
        const licenses = Array.from(this.licenses.values());
        return {
            success: true,
            licenses: licenses
        };
    }
    
    // List all payments (admin function)
    async listPayments() {
        const payments = Array.from(this.payments.values());
        return {
            success: true,
            payments: payments
        };
    }
}

// Create API instance
const api = new SuperGPTAPI();

// Export for use in other files
window.SuperGPTAPI = api;

// Example usage in a real backend (Node.js/Express.js):
/*
const express = require('express');
const app = express();

app.use(express.json());

// Process payment endpoint
app.post('/api/process-payment', async (req, res) => {
    try {
        const result = await api.processPayment(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify license endpoint
app.post('/api/verify-license', async (req, res) => {
    try {
        const { licenseKey, email } = req.body;
        const result = await api.verifyLicense(licenseKey, email);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send license email endpoint
app.post('/api/send-license-email', async (req, res) => {
    try {
        const { email, licenseKey, productName } = req.body;
        const result = await api.sendLicenseEmail(email, licenseKey);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get license info endpoint
app.get('/api/license/:key', async (req, res) => {
    try {
        const result = await api.getLicenseInfo(req.params.key);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3000, () => {
    console.log('SuperGPT API server running on port 3000');
});
*/
