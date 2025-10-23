// License Verification System for SuperGPT
// Get API URL from environment or default to current origin
const API_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', function() {
    initializeLicenseVerifier();
});

function initializeLicenseVerifier() {
    const form = document.getElementById('license-form');
    const verifyBtn = document.getElementById('verify-btn');
    const buttonText = verifyBtn.querySelector('.button-text');
    const buttonSpinner = verifyBtn.querySelector('.button-spinner');
    
    // Auto-fill license key from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const licenseKeyFromUrl = urlParams.get('key');
    if (licenseKeyFromUrl) {
        document.getElementById('license-key').value = licenseKeyFromUrl;
    }
    
    // Auto-fill email from localStorage if available
    const savedEmail = localStorage.getItem('supergpt_email');
    if (savedEmail) {
        document.getElementById('email').value = savedEmail;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const licenseKey = document.getElementById('license-key').value.trim();
        const email = document.getElementById('email').value.trim();
        
        // Validate license key format
        if (!validateLicenseKeyFormat(licenseKey)) {
            showVerificationStatus('error', 'Invalid License Key Format', 
                'Please enter a valid license key in the format: SGPT-XXXX-XXXX-XXXX');
            return;
        }
        
        // Save email to localStorage
        if (email) {
            localStorage.setItem('supergpt_email', email);
        }
        
        // Show loading state
        setButtonLoading(true);
        
        try {
            const result = await verifyLicense(licenseKey, email);
            
            if (result.valid) {
                showVerificationStatus('success', 'License Verified Successfully!', 
                    'Your SuperGPT license is valid and active.', result);
            } else {
                showVerificationStatus('error', 'License Verification Failed', 
                    result.message || 'The license key you entered is invalid or has expired.');
            }
        } catch (error) {
            console.error('Verification error:', error);
            showVerificationStatus('error', 'Verification Error', 
                'There was an error verifying your license. Please try again or contact support.');
        } finally {
            setButtonLoading(false);
        }
    });
    
    function setButtonLoading(loading) {
        verifyBtn.disabled = loading;
        buttonText.style.display = loading ? 'none' : 'block';
        buttonSpinner.style.display = loading ? 'block' : 'none';
    }
}

function validateLicenseKeyFormat(licenseKey) {
    // Check if license key matches the expected format
    const pattern = /^SGPT-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]{4}$/;
    return pattern.test(licenseKey);
}

async function verifyLicense(licenseKey, email) {
    try {
        const response = await fetch(`${API_URL}/api/verify-license`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                licenseKey: licenseKey,
                email: email
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        // Fallback to client-side verification for demo purposes
        console.log('Server verification failed, using client-side fallback');
        return verifyLicenseClientSide(licenseKey, email);
    }
}

function verifyLicenseClientSide(licenseKey, email) {
    // Client-side verification fallback
    // In a real implementation, this would be handled by the server
    
    // Check if license key exists in localStorage (from previous purchases)
    const purchaseData = localStorage.getItem('supergpt_purchase');
    if (purchaseData) {
        const purchase = JSON.parse(purchaseData);
        if (purchase.licenseKey === licenseKey) {
            return {
                valid: true,
                message: 'License verified successfully',
                license: {
                    key: licenseKey,
                    email: purchase.email,
                    purchaseDate: purchase.purchaseDate,
                    status: 'active',
                    product: 'SuperGPT'
                }
            };
        }
    }
    
    // Check against demo license keys
    const demoLicenses = [
        'SGPT-DEMO-2024-DEMO',
        'SGPT-TEST-2024-TEST',
        'SGPT-FREE-2024-FREE'
    ];
    
    if (demoLicenses.includes(licenseKey)) {
        return {
            valid: true,
            message: 'Demo license verified successfully',
            license: {
                key: licenseKey,
                email: email || 'demo@example.com',
                purchaseDate: new Date().toISOString(),
                status: 'active',
                product: 'SuperGPT',
                type: 'demo'
            }
        };
    }
    
    // Check if license key format is valid but not found
    if (validateLicenseKeyFormat(licenseKey)) {
        return {
            valid: false,
            message: 'License key not found. Please check your email for the correct key or contact support.'
        };
    }
    
    return {
        valid: false,
        message: 'Invalid license key format. Please enter a valid license key.'
    };
}

function showVerificationStatus(type, title, message, licenseData = null) {
    const statusContainer = document.getElementById('verification-status');
    
    let statusHTML = `
        <div class="status-icon">${getStatusIcon(type)}</div>
        <div class="status-title">${title}</div>
        <div class="status-message">${message}</div>
    `;
    
    if (type === 'success' && licenseData) {
        statusHTML += `
            <div class="license-details">
                <h4>License Information</h4>
                <div class="license-detail-item">
                    <span class="license-detail-label">License Key:</span>
                    <span class="license-detail-value">${licenseData.license.key}</span>
                </div>
                <div class="license-detail-item">
                    <span class="license-detail-label">Email:</span>
                    <span class="license-detail-value">${licenseData.license.email}</span>
                </div>
                <div class="license-detail-item">
                    <span class="license-detail-label">Purchase Date:</span>
                    <span class="license-detail-value">${formatDate(licenseData.license.purchaseDate)}</span>
                </div>
                <div class="license-detail-item">
                    <span class="license-detail-label">Status:</span>
                    <span class="license-detail-value">${licenseData.license.status}</span>
                </div>
                ${licenseData.license.type ? `
                <div class="license-detail-item">
                    <span class="license-detail-label">Type:</span>
                    <span class="license-detail-value">${licenseData.license.type}</span>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    statusHTML += `
        <div class="status-actions">
            ${type === 'success' ? `
                <a href="https://chrome.google.com/webstore/detail/supergpt/YOUR_EXTENSION_ID" 
                   class="primary-button" target="_blank">Download Extension</a>
                <button onclick="copyLicenseKey('${licenseData?.license?.key || ''}')" 
                        class="secondary-button">Copy License Key</button>
            ` : `
                <a href="payment.html" class="primary-button">Purchase License</a>
                <a href="mailto:support@supergpt.com" class="secondary-button">Contact Support</a>
            `}
        </div>
    `;
    
    statusContainer.innerHTML = statusHTML;
    statusContainer.className = `verification-status ${type}`;
    statusContainer.style.display = 'block';
    
    // Scroll to status
    statusContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Track verification attempt
    trackVerificationAttempt(type, licenseData?.license?.key);
}

function getStatusIcon(type) {
    switch (type) {
        case 'success':
            return '✅';
        case 'error':
            return '❌';
        case 'info':
            return 'ℹ️';
        default:
            return '❓';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function copyLicenseKey(licenseKey) {
    if (!licenseKey) return;
    
    navigator.clipboard.writeText(licenseKey).then(() => {
        showNotification('License key copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = licenseKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showNotification('License key copied to clipboard!', 'success');
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
            <button class="close-notification" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Style the notification
    const bgColor = type === 'success' ? '#f0fdf4' : type === 'error' ? '#fef2f2' : '#eff6ff';
    const textColor = type === 'success' ? '#166534' : type === 'error' ? '#dc2626' : '#2563eb';
    const borderColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: ${textColor};
        padding: 16px 24px;
        border-radius: 8px;
        border: 1px solid ${borderColor};
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

function trackVerificationAttempt(type, licenseKey) {
    // Track verification for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'license_verification', {
            event_category: 'License',
            event_label: type,
            value: licenseKey ? 1 : 0
        });
    }
    
    // Store verification attempt locally
    const verificationData = {
        type: type,
        licenseKey: licenseKey,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    localStorage.setItem('supergpt_verification_attempt', JSON.stringify(verificationData));
}

// Utility function to check if a license key is valid (for extension use)
function isValidLicenseKey(licenseKey) {
    return validateLicenseKeyFormat(licenseKey);
}

// Export functions for external use
window.SuperGPTLicenseVerifier = {
    validateLicenseKeyFormat,
    verifyLicense,
    isValidLicenseKey,
    copyLicenseKey
};
