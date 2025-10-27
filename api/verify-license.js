// Vercel Serverless Function: License Verification API
// This endpoint validates license keys sent from the Chrome extension

// TODO: Replace this with your actual license database
// For production, use Vercel KV, MongoDB, PostgreSQL, or another database
const LICENSES_DB = process.env.LICENSES_DB 
  ? JSON.parse(process.env.LICENSES_DB) 
  : [
    // Example licenses - replace with your actual license data
    // {
    //   key: 'SGPT-EXAMPLE-EXAMPLE-XXXX',
    //   email: 'user@example.com',
    //   expiresAt: '2034-12-31T23:59:59.000Z',
    //   status: 'active',
    //   createdAt: '2024-01-01T00:00:00.000Z'
    // }
  ];

export default async function handler(req, res) {
  // Enable CORS for Chrome extension requests
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
      valid: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { licenseKey, extensionVersion, timestamp } = req.body;

    // Validate input
    if (!licenseKey) {
      return res.status(400).json({ 
        valid: false, 
        error: 'License key required' 
      });
    }

    // Format check
    const key = String(licenseKey).trim().toUpperCase();
    const pattern = /^SGPT-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]{4}$/;
    if (!pattern.test(key)) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Invalid license key format' 
      });
    }

    // Load licenses from storage
    const licenses = await loadLicenses();

    // Check if license exists
    const license = licenses.find(l => l.key === key);

    if (!license) {
      return res.status(200).json({ 
        valid: false, 
        error: 'License not found' 
      });
    }

    // Check if license is revoked
    if (license.status === 'revoked') {
      return res.status(200).json({ 
        valid: false, 
        error: 'License revoked' 
      });
    }

    // Check if license is expired
    const now = new Date();
    const expiresAt = new Date(license.expiresAt);
    
    if (expiresAt < now) {
      return res.status(200).json({ 
        valid: false, 
        error: 'License expired' 
      });
    }

    // Log verification (optional, for analytics)
    console.log(`License verified: ${key}, Version: ${extensionVersion}`);

    // Return valid license
    return res.status(200).json({
      valid: true,
      license: {
        key: license.key,
        email: license.email,
        expiresAt: license.expiresAt,
        status: license.status
      }
    });

  } catch (error) {
    console.error('License verification error:', error);
    return res.status(500).json({ 
      valid: false, 
      error: 'Internal server error' 
    });
  }
}

// Helper function to load licenses from storage
async function loadLicenses() {
  try {
    // In production, replace this with your actual database query
    // Examples:
    // - Vercel KV: const { kv } = require('@vercel/kv');
    // - MongoDB: const client = await MongoClient.connect(uri);
    // - PostgreSQL: const client = await pool.connect();
    
    // For now, return the in-memory database from environment variable
    return LICENSES_DB;
  } catch (error) {
    console.error('Error loading licenses:', error);
    return [];
  }
}

