// pages/api/middleware/auth.js
import jwt from 'jsonwebtoken';

export default function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        status: 0, 
        message: 'Access token required' 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'xxxxz', (err, user) => {
      if (err) {
        return res.status(403).json({ 
          status: 0, 
          message: 'Invalid or expired token' 
        });
      }

      req.user = user; // Attach user info to request
      next();
    });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ 
      status: 0, 
      message: 'Internal Server Error' 
    });
  }
}

// Alternative: Async/await version
export async function authenticateTokenAsync(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new Error('Access token required');
    }

    const user = jwt.verify(token, process.env.JWT_SECRET || 'xxxxz');
    req.user = user;
    return true;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(403).json({ status: 0, message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(403).json({ status: 0, message: 'Token expired' });
    } else {
      res.status(401).json({ status: 0, message: error.message });
    }
    return false;
  }
}