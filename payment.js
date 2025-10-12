// Paddle Payment Integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Paddle
    Paddle.Setup({
        vendor: 123456, // Replace with your Paddle vendor ID
        environment: 'production' // Change to 'sandbox' for testing
    });

    // Create Paddle checkout button
    const checkoutButton = document.createElement('button');
    checkoutButton.className = 'paddle-checkout-button';
    checkoutButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>
        <span>Support Development - $9.90</span>
    `;
    
    // Style the button
    checkoutButton.style.cssText = `
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border: none;
        padding: 16px 32px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 20px auto;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    `;

    // Add hover effects
    checkoutButton.addEventListener('mouseenter', () => {
        checkoutButton.style.transform = 'translateY(-2px)';
        checkoutButton.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
    });

    checkoutButton.addEventListener('mouseleave', () => {
        checkoutButton.style.transform = 'translateY(0)';
        checkoutButton.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
    });

    // Add click handler for Paddle checkout
    checkoutButton.addEventListener('click', function() {
        // Show loading state
        checkoutButton.disabled = true;
        checkoutButton.innerHTML = `
            <div style="width: 20px; height: 20px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span>Processing...</span>
        `;

        // Open Paddle checkout
        Paddle.Checkout.open({
            product: 'YOUR_PRODUCT_ID', // Replace with your Paddle product ID
            email: '', // Optional: pre-fill email
            allowQuantity: false,
            quantity: 1,
            disableLogout: true,
            frameTarget: 'checkout',
            frameInitialHeight: 366,
            frameStyle: 'width: 100%; min-width: 312px; background-color: transparent; border: none;',
            eventCallback: function(data) {
                console.log('Paddle event:', data);
                
                if (data.name === 'checkout.loaded') {
                    console.log('Checkout loaded');
                }
                
                if (data.name === 'checkout.completed') {
                    // Payment successful
                    showPaymentSuccess(data);
                    checkoutButton.disabled = false;
                    checkoutButton.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                        <span>Support Development - $9.90</span>
                    `;
                }
                
                if (data.name === 'checkout.closed') {
                    // Checkout closed
                    checkoutButton.disabled = false;
                    checkoutButton.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                        <span>Support Development - $9.90</span>
                    `;
                }
            }
        });
    });

    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Append button to container
    const container = document.getElementById('paddle-button-container');
    if (container) {
        container.appendChild(checkoutButton);
    }
});

// Payment success handler
function showPaymentSuccess(data) {
    // Create success modal
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Thank you for supporting ChatGPT Enhancer development.</p>
            <div class="payment-details">
                <p><strong>Transaction ID:</strong> ${data.data?.transaction_id || 'N/A'}</p>
                <p><strong>Amount:</strong> $9.90 USD</p>
                <p><strong>Status:</strong> Completed</p>
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

// Optional: Send payment data to server
function sendPaymentToServer(details) {
    fetch('/api/payment-success', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transactionId: details.transaction_id,
            amount: '9.90',
            currency: 'USD',
            status: 'completed',
            paymentMethod: 'Paddle'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Payment data sent to server:', data);
    })
    .catch(error => {
        console.error('Error sending payment data:', error);
    });
}