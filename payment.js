// PayPal Payment Integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize PayPal button
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '9.90',
                        currency_code: 'USD'
                    },
                    description: 'SuperGPT - Support Development'
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // Payment successful
                showPaymentSuccess(details);
                
                // Log payment details
                console.log('Payment completed:', details);
                
                // Send payment data to server to generate license
                sendPaymentToServer(details);
            });
        },
        onError: function(err) {
            // Payment failed
            showPaymentError(err);
            console.error('Payment error:', err);
        },
        onCancel: function(data) {
            // Payment cancelled
            showPaymentCancelled();
            console.log('Payment cancelled:', data);
        }
    }).render('#paypal-button-container');
});

// Payment success handler
function showPaymentSuccess(details) {
    // Create success modal
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Thank you for supporting SuperGPT development.</p>
            <div class="payment-details">
                <p><strong>Transaction ID:</strong> ${details.id}</p>
                <p><strong>Amount:</strong> $9.90 USD</p>
                <p><strong>Status:</strong> ${details.status}</p>
            </div>
            <button onclick="closeModal()" class="close-button">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .payment-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .modal-content {
            background: white;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
            margin: 20px;
        }
        .success-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .modal-content h2 {
            color: #1f2937;
            margin-bottom: 16px;
        }
        .modal-content p {
            color: #6b7280;
            margin-bottom: 20px;
        }
        .payment-details {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
        }
        .payment-details p {
            margin: 8px 0;
            font-size: 14px;
        }
        .close-button {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .close-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
    `;
    document.head.appendChild(style);
}

// Payment error handler
function showPaymentError(error) {
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="error-icon">❌</div>
            <h2>Payment Failed</h2>
            <p>There was an error processing your payment. Please try again.</p>
            <p class="error-message">${error.message || 'Unknown error occurred'}</p>
            <button onclick="closeModal()" class="close-button">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Payment cancelled handler
function showPaymentCancelled() {
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="cancel-icon">⏹️</div>
            <h2>Payment Cancelled</h2>
            <p>Your payment was cancelled. You can try again anytime.</p>
            <button onclick="closeModal()" class="close-button">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close modal function
function closeModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        modal.remove();
    }
}

// Send payment data to server to generate license
function sendPaymentToServer(details) {
    const API_URL = 'https://www.superwebextensions.com/api/payment-webhook';
    
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transactionId: details.id,
            amount: '9.90',
            currency: 'USD',
            status: details.status,
            payerEmail: details.payer.email_address,
            payerName: details.payer.name.given_name + ' ' + details.payer.name.surname
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Payment data sent to server:', data);
        
        // Display license key to user
        if (data.success && data.license) {
            showLicenseKey(data.license.key);
        }
    })
    .catch(error => {
        console.error('Error sending payment data:', error);
    });
}

// Show license key to user after payment
function showLicenseKey(licenseKey) {
    const licenseSection = document.createElement('div');
    licenseSection.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        max-width: 500px;
        text-align: center;
    `;
    
    licenseSection.innerHTML = `
        <h2 style="color: #1f2937; margin-bottom: 20px;">Your License Key</h2>
        <p style="color: #6b7280; margin-bottom: 20px;">
            Thank you for your purchase! Your license key has been sent to your email.
        </p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-family: monospace; font-size: 18px; font-weight: bold; color: #3b82f6; word-break: break-all;">
                ${licenseKey}
            </p>
        </div>
        <button onclick="closeLicenseModal()" class="close-button" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
            Copy & Close
        </button>
    `;
    
    document.body.appendChild(licenseSection);
    
    // Copy to clipboard functionality
    const button = licenseSection.querySelector('button');
    button.onclick = function() {
        navigator.clipboard.writeText(licenseKey).then(() => {
            button.textContent = 'Copied!';
            setTimeout(() => {
                document.body.removeChild(licenseSection);
            }, 1000);
        });
    };
}
