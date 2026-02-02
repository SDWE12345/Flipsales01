// pages/api/auth/login.js - Optimized Login API
import { findOne } from '../lib/db/helpers';
import { generateToken } from '../lib/middleware/auth';
import { validateEmail, validatePassword, ValidationError } from '../lib/utils/validation';
import bcrypt from 'bcryptjs';

// Rate limiting for login attempts
const loginAttempts = new Map();

function checkLoginAttempts(email) {
  const attempts = loginAttempts.get(email) || { count: 0, timestamp: Date.now() };
  const now = Date.now();
  
  // Reset after 15 minutes
  if (now - attempts.timestamp > 900000) {
    loginAttempts.set(email, { count: 1, timestamp: now });
    return true;
  }
  
  // Max 5 attempts per 15 minutes
  if (attempts.count >= 5) {
    return false;
  }
  
  loginAttempts.set(email, { count: attempts.count + 1, timestamp: attempts.timestamp });
  return true;
}

function clearLoginAttempts(email) {
  loginAttempts.delete(email);
}

export default async function handler(req, res) {
  // Only POST method allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 0, 
      message: 'Method not allowed' 
    });
  }

  const startTime = Date.now();

  try {
    // Extract and validate input
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: 0, 
        message: 'Email and password are required' 
      });
    }

    const validatedEmail = validateEmail(email);

    // Check rate limiting
    if (!checkLoginAttempts(validatedEmail)) {
      return res.status(429).json({ 
        status: 0, 
        message: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    // Find user (optimized query with projection)
    const user = await findOne(
      'users',
      { email: validatedEmail },
      { projection: { email: 1, password: 1, name: 1, role: 1 } }
    );

    if (!user) {
      return res.status(401).json({ 
        status: 0, 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Hashed password
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain text (migrate to hashed)
      isPasswordValid = password === user.password;
      
      // Auto-migrate to hashed password
      if (isPasswordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { updateOne } = require('../lib/db/helpers');
        await updateOne('users', { _id: user._id }, { 
          $set: { password: hashedPassword } 
        });
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: 0, 
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Clear failed attempts
    clearLoginAttempts(validatedEmail);

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'user'
    }, '24h');

    // Generate refresh token (longer expiry)
    const refreshToken = generateToken({
      userId: user._id.toString(),
      type: 'refresh'
    }, '7d');

    const duration = Date.now() - startTime;

    // Success response
    return res.status(200).json({ 
      status: 1,
      message: 'Login successful', 
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      _meta: {
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    console.error('Login Error:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({ 
        status: 0, 
        message: error.message,
        field: error.field
      });
    }

    return res.status(500).json({ 
      status: 0, 
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
}