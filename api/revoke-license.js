// Vercel Serverless Function: Revoke License Key
// This endpoint revokes licenses (admin use)

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
    const { licenseKey, adminKey } = req.body;

    // Simple admin authentication
    const ADMIN_KEY = '99cf9244775553d93b97691da41c808507f80f375b31200b8026ab9b5afc4b0a';
    
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    // Validate license key
    if (!licenseKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'License key required' 
      });
    }

    await ensureRedisConnection();
    
    // Get existing licenses
    const licensesData = await redisClient.get('licenses');
    const licenses = licensesData ? JSON.parse(licensesData) : [];
    
    // Find and revoke the license
    const licenseIndex = licenses.findIndex(l => l.key === licenseKey.toUpperCase());
    
    if (licenseIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'License not found' 
      });
    }
    
    // Revoke the license
    licenses[licenseIndex].status = 'revoked';
    licenses[licenseIndex].revokedAt = new Date().toISOString();
    
    // Save back to Redis
    await redisClient.set('licenses', JSON.stringify(licenses));
    
    console.log(`License revoked: ${licenseKey}`);
    
    return res.status(200).json({
      success: true,
      message: 'License revoked successfully',
      license: licenses[licenseIndex]
    });

  } catch (error) {
    console.error('License revocation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

