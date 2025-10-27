// Vercel Serverless Function: PayPal Payment Webhook
// This endpoint handles PayPal payment notifications and generates licenses

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

// Save license to Redis
async function saveLicense(license) {
  try {
    await ensureRedisConnection();
    
    // Get existing licenses from Redis
    const licensesData = await redisClient.get('licenses');
    const existingLicenses = licensesData ? JSON.parse(licensesData) : [];
    
    // Add new license
    existingLicenses.push(license);
    
    // Save back to Redis
    await redisClient.set('licenses', JSON.stringify(existingLicenses));
    
    console.log(`License saved to Redis: ${license.key} for ${license.email}`);
    
    // TODO: Send email to user with license key
    // await sendLicenseEmail(license.email, license.key);
    
  } catch (error) {
    console.error('Error saving license to Redis:', error);
    throw error;
  }
}

