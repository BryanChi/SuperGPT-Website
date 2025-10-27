// Vercel Serverless Function: List All Licenses
// This endpoint lists all licenses (admin use)

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
    const { adminKey } = req.body;

    // Simple admin authentication
    const ADMIN_KEY = '99cf9244775553d93b97691da41c808507f80f375b31200b8026ab9b5afc4b0a';
    
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    await ensureRedisConnection();
    
    // Get all licenses from Redis
    const licensesData = await redisClient.get('licenses');
    const licenses = licensesData ? JSON.parse(licensesData) : [];
    
    // Filter active licenses
    const now = new Date();
    const activeLicenses = licenses.filter(license => {
      const expiresAt = new Date(license.expiresAt);
      return license.status === 'active' && expiresAt > now;
    });
    
    return res.status(200).json({
      success: true,
      total: licenses.length,
      active: activeLicenses.length,
      revoked: licenses.filter(l => l.status === 'revoked').length,
      expired: licenses.filter(l => {
        const expiresAt = new Date(l.expiresAt);
        return expiresAt <= now && l.status === 'active';
      }).length,
      licenses: licenses
    });

  } catch (error) {
    console.error('List licenses error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

