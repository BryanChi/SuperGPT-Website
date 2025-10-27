// Vercel Serverless Function: License Verification API
// This endpoint validates license keys sent from the Chrome extension

import { createClient } from 'redis';

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://default:57lO1epamjie9Z9vepa8SmXUE00eCxZn@redis-11872.c322.us-east-1-2.ec2.redns.redis-cloud.com:11872'
});

// Connect to Redis (reuse connection in serverless)
let redisReady = false;
async function ensureRedisConnection() {
  if (!redisReady) {
    await redisClient.connect();
    redisReady = true;
  }
}

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

// Helper function to load licenses from Redis
async function loadLicenses() {
  try {
    await ensureRedisConnection();
    const licenses = await redisClient.get('licenses');
    return licenses ? JSON.parse(licenses) : [];
  } catch (error) {
    console.error('Error loading licenses from Redis:', error);
    return [];
  }
}

