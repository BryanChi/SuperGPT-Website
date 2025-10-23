# SuperGPT Website

This is the official website for SuperGPT, a Chrome extension that enhances ChatGPT with powerful features including PayPal payment integration and license verification system.

## Features

- Color-coded conversation backgrounds
- Smart prompt navigation
- Typography controls
- Chat pinning
- Per-prompt controls
- Customizable color schemes
- Automatic theme adaptation
- Remove "Limit Reached" messages
- PayPal payment integration
- License key generation and verification
- Email delivery system

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- PayPal Developer Account (for payment processing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/supergpt-website.git
cd supergpt-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up PayPal integration:
   - Create a PayPal Developer account
   - Create a new application
   - Get your Client ID
   - Update the PayPal Client ID in `payment.html`:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD&intent=capture"></script>
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit `http://localhost:3000`

### Production Deployment

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Project Structure

```
supergpt-website/
├── index.html              # Main landing page
├── payment.html            # Payment confirmation page
├── verify.html             # License verification page
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript functionality
├── payment-processor.js    # PayPal payment processing
├── license-verifier.js     # License verification system
├── api.js                  # API utilities
├── server.js               # Node.js backend server
├── package.json            # Node.js dependencies
├── images/                 # Website images
├── videos/                 # Feature demonstration videos
└── README.md               # This file
```

## API Endpoints

### Payment Processing
- `POST /api/process-payment` - Process PayPal payment and generate license
- `POST /api/send-license-email` - Send license key via email

### License Verification
- `POST /api/verify-license` - Verify license key
- `GET /api/license/:key` - Get license information

### Admin (Optional)
- `GET /api/admin/licenses` - List all licenses
- `GET /api/admin/payments` - List all payments

## PayPal Integration

The website integrates with PayPal for secure payment processing:

1. User clicks "Get SuperGPT Now" button
2. Redirects to payment confirmation page
3. PayPal button is rendered
4. User completes payment via PayPal
5. Payment is processed and license key is generated
6. License key is sent to user's email
7. User can verify license on the verification page

## License System

### License Key Format
License keys follow the format: `SGPT-XXXX-XXXX-XXXX`

### License Verification Process
1. User enters license key on verification page
2. System validates license key format
3. Checks license status in database
4. Returns verification result
5. If valid, user can download and activate extension

### Demo License Keys
For testing purposes, these demo license keys are available:
- `SGPT-DEMO-2024-DEMO`
- `SGPT-TEST-2024-TEST`

## Email System

The system includes email functionality for:
- Sending license keys after purchase
- Sending verification confirmations
- Sending support notifications

*Note: In the current implementation, email sending is simulated. For production, integrate with a service like SendGrid, Mailgun, or AWS SES.*

## Security Considerations

- License keys are generated with cryptographic checksums
- Payment data is processed securely through PayPal
- License verification includes multiple validation layers
- All API endpoints include error handling and validation

## Customization

### Styling
- Modify `styles.css` for custom styling
- All colors and fonts can be customized
- Responsive design is included

### Functionality
- Update `script.js` for additional frontend features
- Modify `server.js` for backend changes
- Add new API endpoints as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support, please contact:
- Email: support@supergpt.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/supergpt-website/issues)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- PayPal for payment processing
- Chrome Extension API for extension functionality
- OpenAI for ChatGPT platform