// Vercel Serverless Function: PayPal Payment Webhook
// This endpoint handles PayPal payment notifications and generates licenses

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { payerEmail, transactionId, amount, payerName } = req.body;

    // Validate payment data
    if (!payerEmail || !transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing payment data' 
      });
    }

    // Generate license key
    const licenseKey = generateLicenseKey();
    
    // Set expiry date (10 years from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 10);

    const license = {
      key: licenseKey,
      email: payerEmail,
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      transactionId: transactionId,
      amount: amount,
      payerName: payerName
    };

    // Save license to storage
    await saveLicense(license);

    // Log payment
    console.log(`Payment received: ${transactionId}, License: ${licenseKey}`);

    return res.status(200).json({
      success: true,
      license: license
    });

  } catch (error) {
    console.error('Payment webhook error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Generate SGPT license key with checksum
function generateLicenseKey() {
  // Generate timestamp-based part
  const ts = Date.now().toString(36).toUpperCase();
  
  // Generate random part
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Compute checksum
  const checksum = computeChecksumBase36(ts + rand);
  
  return `SGPT-${ts}-${rand}-${checksum}`;
}

// Compute checksum from input string
function computeChecksumBase36(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit int
  }
  return Math.abs(hash).toString(36).toUpperCase().substring(0, 4);
}

// Save license to storage
async function saveLicense(license) {
  try {
    // In production, replace this with your actual database save
    // For now, we'll use environment variable updates
    
    // Get existing licenses
    const existingLicenses = process.env.LICENSES_DB 
      ? JSON.parse(process.env.LICENSES_DB) 
      : [];
    
    // Add new license
    existingLicenses.push(license);
    
    // Update environment variable (this won't persist in serverless)
    // In production, use a database instead
    process.env.LICENSES_DB = JSON.stringify(existingLicenses);
    
    console.log(`License saved: ${license.key} for ${license.email}`);
    
    // TODO: Send email to user with license key
    // await sendLicenseEmail(license.email, license.key);
    
  } catch (error) {
    console.error('Error saving license:', error);
    throw error;
  }
}

