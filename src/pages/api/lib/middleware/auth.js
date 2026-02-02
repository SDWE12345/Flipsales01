// lib/middleware/auth.js - Enhanced Authentication Middleware
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// Rate limiting storage (in-memory, use Redis in production)
const rateLimitStore = new Map();

// Rate limiter function
function checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier) || [];
  
  // Remove old requests outside the time window
  const validRequests = userRequests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  
  return true;
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((requests, key) => {
    const validRequests = requests.filter(time => now - time < 60000);
    if (validRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validRequests);
    }
  });
}, 60000); // Clean every minute

export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        status: 0, 
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            status: 0, 
            message: 'Token expired',
            code: 'TOKEN_EXPIRED'
          });
        }
        return res.status(403).json({ 
          status: 0, 
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      // Rate limiting per user
      if (!checkRateLimit(decoded.userId, 1000, 60000)) {
        return res.status(429).json({
          status: 0,
          message: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ 
      status: 0, 
      message: 'Internal server error',
      code: 'AUTH_ERROR'
    });
  }
}

// Async version for cleaner code
export async function authenticateTokenAsync(req, res) {
  return new Promise((resolve, reject) => {
    authenticateToken(req, res, (error) => {
      if (error) reject(error);
      else resolve(req.user);
    });
  });
}

// Generate JWT token
export function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Refresh token
export function refreshToken(oldToken) {
  try {
    const decoded = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true });
    delete decoded.iat;
    delete decoded.exp;
    return generateToken(decoded);
  } catch (error) {
    throw new Error('Invalid token for refresh');
  }
}

// Verify token without middleware
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export default authenticateToken;