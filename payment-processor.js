// PayPal Payment Processor for SuperGPT
let paypalButtonRendered = false;
let paypalPurchaseCompleted = false;

// Get API URL from environment or default to current origin
const API_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for PayPal SDK to load
    setTimeout(() => {
        if (typeof paypal !== 'undefined') {
            initializePayPal();
        } else {
            console.error('PayPal SDK not loaded');
            showPayPalNotAvailable();
        }
    }, 1000);
    
    // Initialize demo payment button
    initializeDemoPayment();
});

function initializePayPal() {
    // Prevent duplicate rendering
    if (paypalButtonRendered) {
        return;
    }
    
    // Render PayPal button
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 50
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '9.90',
                        currency_code: 'USD'
                    },
                    description: 'SuperGPT - Lifetime License',
                    custom_id: 'supergpt-license',
                    item: {
                        name: 'SuperGPT License',
                        description: 'Lifetime access to all SuperGPT features',
                        quantity: '1',
                        unit_amount: {
                            currency_code: 'USD',
                            value: '9.90'
                        }
                    }
                }],
                application_context: {
                    brand_name: 'SuperGPT',
                    landing_page: 'NO_PREFERENCE',
                    user_action: 'PAY_NOW'
                }
            });
        },
        onApprove: function(data, actions) {
            // Show loading state
            showLoadingState();
            
            return actions.order.capture().then(function(details) {
                console.log('Payment approved:', details);
                
                // If status indicates completed, proceed
                const status = details.status || details.purchase_units?.[0]?.payments?.captures?.[0]?.status;
                if (status === 'COMPLETED') {
                    processSuccessfulPayment(details);
                    return;
                }
                
                // Fallback: fetch order details and proceed if already captured
                return actions.order.get().then(function(orderDetails) {
                    console.log('Order details after capture attempt:', orderDetails);
                    const orderStatus = orderDetails.status || orderDetails.purchase_units?.[0]?.payments?.captures?.[0]?.status;
                    if (orderStatus === 'COMPLETED') {
                        processSuccessfulPayment(orderDetails);
                        return;
                    }
                    showError(`Payment not completed (status: ${orderStatus || 'unknown'}). Please try again.`);
                    hideLoadingState();
                });
            }).catch(function(error) {
                console.error('Payment capture error:', error);
                // Retry on instrument declined (common sandbox flow)
                if (error && (error.name === 'INSTRUMENT_DECLINED' || (error.details && error.details[0] && error.details[0].issue === 'INSTRUMENT_DECLINED'))) {
                    console.log('Retrying payment due to INSTRUMENT_DECLINED...');
                    return actions.restart();
                }
                // If order is already captured, fetch details and proceed
                if (error && ((error.name === 'ORDER_ALREADY_CAPTURED') || (error.details && error.details[0] && error.details[0].issue === 'ORDER_ALREADY_CAPTURED'))) {
                    console.log('Order already captured, fetching order details...');
                    return actions.order.get().then(function(orderDetails) {
                        console.log('Order details (already captured):', orderDetails);
                        processSuccessfulPayment(orderDetails);
                        hideLoadingState();
                    }).catch(function(getErr) {
                        console.error('Failed to fetch order after capture error:', getErr);
                        showError('Payment completed but confirmation failed. Please check your PayPal activity.');
                        hideLoadingState();
                    });
                }
                const issue = (error && error.details && error.details[0] && (error.details[0].issue || error.details[0].description)) || (error && (error.name || error.message));
                showError(issue ? `Payment failed: ${issue}` : 'Payment processing failed. Please try again.');
                hideLoadingState();
            });
        },
        onError: function(err) {
            if (paypalPurchaseCompleted) {
                console.warn('Ignoring PayPal onError after completion:', err);
                return;
            }
            console.error('PayPal error:', err);
            const firstDetail = (err && err.details && err.details[0]) || {};
            const parts = [];
            if (err && (err.name || err.message)) parts.push(err.name || err.message);
            if (firstDetail.issue) parts.push(firstDetail.issue);
            if (firstDetail.description) parts.push(firstDetail.description);
            if (err && err.debug_id) parts.push(`debug_id: ${err.debug_id}`);
            const errorMessage = parts.length ? `Payment failed: ${parts.join(' - ')}` : 'Payment failed. Please try again.';
            showError(errorMessage);
            hideLoadingState();
        },
        onCancel: function(data) {
            console.log('Payment cancelled:', data);
            showInfo('Payment was cancelled. You can try again anytime.');
            // Don't call hideLoadingState to prevent duplicate buttons
        }
    }).render('#paypal-button-container').then(() => {
        paypalButtonRendered = true;
    });
}

function processSuccessfulPayment(details) {
    paypalPurchaseCompleted = true;
    
    // Get customer email from PayPal details
    const customerEmail = details.payer?.email_address || 'unknown@example.com';
    const payerName = details.payer?.name?.given_name + ' ' + details.payer?.name?.surname;
    
    console.log('Processing payment:', {
        transactionId: details.id,
        customerEmail: customerEmail,
        amount: details.purchase_units[0]?.amount?.value || '9.90',
        currency: details.purchase_units[0]?.amount?.currency_code || 'USD'
    });
    
    // Send payment data to webhook API to generate license
    sendPaymentToBackend({
        transactionId: details.id,
        amount: details.purchase_units[0]?.amount?.value || '9.90',
        currency: details.purchase_units[0]?.amount?.currency_code || 'USD',
        status: details.status || 'completed',
        payerEmail: customerEmail,
        payerName: payerName
    }).then(data => {
        // Server generated license key
        const licenseKey = data.license?.key;
        
        if (licenseKey) {
            // Show success modal with license key
            showSuccessModal(licenseKey, customerEmail);
        } else {
            showError('Payment successful but license generation failed. Please contact support.');
        }
        
        // Hide loading state
        hideLoadingState();
        
    }).catch(error => {
        console.error('Backend error:', error);
        showError('Payment successful but license generation failed. Please contact support with transaction ID: ' + details.id);
        hideLoadingState();
    });
}

function generateLicenseKey() {
    // Generate a unique license key
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
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).toUpperCase().substring(0, 4);
}

function sendPaymentToBackend(paymentData) {
    // Send to our payment webhook API
    return fetch('https://www.superwebextensions.com/api/payment-webhook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Backend request failed');
        }
        return response.json();
    });
}

function sendLicenseEmail(email, licenseKey) {
    // Send email with license key
    fetch(`${API_URL}/api/send-license-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            licenseKey: licenseKey,
            productName: 'SuperGPT'
        })
    }).catch(error => {
        console.error('Email sending failed:', error);
    });
}

function showSuccessModal(licenseKey, email) {
    const modal = document.getElementById('success-modal');
    const licenseKeyText = document.getElementById('license-key-text');
    const copyBtn = document.getElementById('copy-license-btn');
    
    // Update license key display
    licenseKeyText.textContent = licenseKey;
    
    // Copy button functionality
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(licenseKey).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = licenseKey;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        });
    });
    
    // Download extension button
    document.getElementById('download-extension-btn').addEventListener('click', function() {
        // Redirect to download page or trigger download
        window.open('https://chrome.google.com/webstore/detail/supergpt/YOUR_EXTENSION_ID', '_blank');
    });
    
    // Close modal button
    document.getElementById('close-modal-btn').addEventListener('click', function() {
        modal.style.display = 'none';
        // Redirect to home page
        window.location.href = 'index.html';
    });
    
    // Show modal
    modal.style.display = 'flex';
    
    // Track successful purchase
    trackPurchase(licenseKey, email);
}

function showLoadingState() {
    // Create an overlay that does NOT remove or replace the PayPal button DOM
    let overlay = document.getElementById('payment-loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'payment-loading-overlay';
        overlay.innerHTML = `
            <div class="loading-backdrop"></div>
            <div class="loading-panel">
                <div class="spinner"></div>
                <p>Processing payment...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';

    // Add loading styles once
    if (!document.getElementById('payment-loading-styles')) {
        const style = document.createElement('style');
        style.id = 'payment-loading-styles';
        style.textContent = `
            #payment-loading-overlay {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: none;
            }
            #payment-loading-overlay .loading-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.35);
                backdrop-filter: blur(2px);
            }
            #payment-loading-overlay .loading-panel {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 24px 28px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                text-align: center;
                color: #1f2937;
                min-width: 240px;
            }
            #payment-loading-overlay .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f4f6;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 12px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

function hideLoadingState() {
    const overlay = document.getElementById('payment-loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showPayPalNotAvailable() {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = `
        <div class="paypal-unavailable">
            <div class="unavailable-icon">💳</div>
            <h3>PayPal Integration Required</h3>
            <p>To enable payments, you need to set up PayPal integration:</p>
            <ol>
                <li>Create a PayPal Developer account</li>
                <li>Get your Client ID</li>
                <li>Update the PayPal Client ID in payment.html</li>
            </ol>
            <div class="demo-note">
                <strong>Demo Mode:</strong> You can test the license verification system using demo keys:
                <br><code>SGPT-DEMO-2024-DEMO</code> or <code>SGPT-TEST-2024-TEST</code>
            </div>
            <a href="verify.html" class="demo-button">Test License Verification</a>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .paypal-unavailable {
            text-align: center;
            padding: 40px;
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            margin: 20px 0;
        }
        .unavailable-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .paypal-unavailable h3 {
            color: #1f2937;
            margin-bottom: 16px;
            font-size: 1.25rem;
        }
        .paypal-unavailable p {
            color: #6b7280;
            margin-bottom: 16px;
        }
        .paypal-unavailable ol {
            text-align: left;
            color: #6b7280;
            margin: 16px 0;
            padding-left: 20px;
        }
        .paypal-unavailable li {
            margin-bottom: 8px;
        }
        .demo-note {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            color: #1e40af;
        }
        .demo-note code {
            background: #dbeafe;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        .demo-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 16px;
            transition: all 0.3s ease;
        }
        .demo-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }
    `;
    document.head.appendChild(style);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="error-icon">❌</span>
            <span class="error-message">${message}</span>
            <button class="close-notification" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fef2f2;
        color: #dc2626;
        padding: 16px 24px;
        border-radius: 8px;
        border: 1px solid #fecaca;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function showInfo(message) {
    const notification = document.createElement('div');
    notification.className = 'info-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="info-icon">ℹ️</span>
            <span class="info-message">${message}</span>
            <button class="close-notification" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #eff6ff;
        color: #2563eb;
        padding: 16px 24px;
        border-radius: 8px;
        border: 1px solid #bfdbfe;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

function trackPurchase(licenseKey, email) {
    // Track purchase for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
            transaction_id: licenseKey,
            value: 9.90,
            currency: 'USD',
            items: [{
                item_id: 'supergpt-license',
                item_name: 'SuperGPT License',
                category: 'Software',
                quantity: 1,
                price: 9.90
            }]
        });
    }
    
    // Store purchase data locally
    const purchaseData = {
        licenseKey: licenseKey,
        email: email,
        purchaseDate: new Date().toISOString(),
        product: 'SuperGPT'
    };
    
    localStorage.setItem('supergpt_purchase', JSON.stringify(purchaseData));
}

// Utility function to validate license key format
function validateLicenseKey(licenseKey) {
    const pattern = /^SGPT-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]{4}$/;
    return pattern.test(licenseKey);
}

// Demo Payment Functionality
function initializeDemoPayment() {
    const demoButton = document.getElementById('demo-payment-btn');
    if (demoButton) {
        demoButton.addEventListener('click', function() {
            // Show confirmation dialog
            if (confirm('This will generate a demo license key without processing a real payment. Continue?')) {
                processDemoPayment();
            }
        });
    }
}

function processDemoPayment() {
    // Show loading state
    const demoButton = document.getElementById('demo-payment-btn');
    const originalContent = demoButton.innerHTML;
    
    demoButton.disabled = true;
    demoButton.innerHTML = `
        <div class="demo-spinner"></div>
        <span>Generating Demo License...</span>
    `;
    
    // Add spinner styles
    const style = document.createElement('style');
    style.textContent = `
        .demo-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid transparent;
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);
    
    // Simulate payment processing delay
    setTimeout(() => {
        // Generate license key
        const licenseKey = generateLicenseKey();
        const customerEmail = 'demo@example.com';
        
        // Create demo payment details
        const demoPaymentDetails = {
            id: 'demo-' + Date.now(),
            status: 'COMPLETED',
            payer: {
                email_address: customerEmail
            },
            purchase_units: [{
                amount: {
                    value: '9.90',
                    currency_code: 'USD'
                }
            }]
        };
        
        // Process the demo payment
        processSuccessfulPayment(demoPaymentDetails);
        
        // Reset button
        demoButton.disabled = false;
        demoButton.innerHTML = originalContent;
        
    }, 2000);
}

// Export functions for external use
window.SuperGPTPayment = {
    generateLicenseKey,
    validateLicenseKey,
    trackPurchase,
    processDemoPayment
};
