// Configuration file for SuperGPT
const config = {
    // PayPal Configuration
    paypal: {
        clientId: 'AW1bo3Og1P_xaSVEzcv3R-umo6OPXCMmnaBgdl7Xk3GoTQacCwuKxJqOmz4Vnirl9VOhVIguwbLUfKoC',
        clientSecret: 'EBSBs5tENoExQ0JIqwXglQmuoT5G6O8LLCVKQrvBnpnrULOvu68upryKZ0-yg9TuorXjAInWtCxEnLDp',
        mode: 'sandbox', // Change to 'live' for production
        currency: 'USD'
    },
    
    // Product Configuration
    product: {
        name: 'SuperGPT',
        description: 'Lifetime access to all SuperGPT features',
        price: '9.90',
        currency: 'USD'
    },
    
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development',
        // Backend API URL - use environment variable for Vercel deployment
        apiUrl: process.env.API_URL || 'http://localhost:3000'
    },
    
    // Email Configuration (for future use)
    email: {
        service: 'sendgrid',
        apiKey: process.env.SENDGRID_API_KEY || '',
        fromEmail: 'noreply@supergpt.com'
    }
};

module.exports = config;
