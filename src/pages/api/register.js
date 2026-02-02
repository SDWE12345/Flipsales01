// pages/api/auth/register.js - Optimized Registration API
import { findOne, insertOne } from '../lib/db/helpers';
import { generateToken } from '../lib/middleware/auth';
import { 
  validateEmail, 
  validatePassword, 
  sanitizeString,
  ValidationError 
} from '../lib/utils/validation';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 0, 
      message: 'Method not allowed' 
    });
  }

  const startTime = Date.now();

  try {
    const { email, password, name, phone } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        status: 0,
        message: 'Email and password are required' 
      });
    }

    // Validate and sanitize inputs
    const validatedEmail = validateEmail(email);
    validatePassword(password, 6);
    const sanitizedName = name ? sanitizeString(name, 100) : validatedEmail.split('@')[0];

    // Check if user already exists
    const existingUser = await findOne('users', { email: validatedEmail });

    if (existingUser) {
      return res.status(409).json({ 
        status: 0,
        message: 'User already exists with this email',
        code: 'USER_EXISTS'
      });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      email: validatedEmail,
      password: hashedPassword,
      name: sanitizedName,
      phone: phone ? sanitizeString(phone, 20) : null,
      role: 'user',
      isEmailVerified: false,
      isActive: true,
      profile: {
        avatar: null,
        bio: null
      },
      preferences: {
        newsletter: true,
        notifications: true
      }
    };

    const insertedUser = await insertOne('users', newUser);

    // Generate JWT tokens
    const token = generateToken({
      userId: insertedUser._id.toString(),
      email: insertedUser.email,
      role: insertedUser.role
    }, '24h');

    const refreshToken = generateToken({
      userId: insertedUser._id.toString(),
      type: 'refresh'
    }, '7d');

    const duration = Date.now() - startTime;

    // Success response (exclude password)
    return res.status(201).json({ 
      status: 1,
      message: 'User registered successfully', 
      token,
      refreshToken,
      user: {
        id: insertedUser._id,
        email: insertedUser.email,
        name: insertedUser.name,
        role: insertedUser.role,
        createdAt: insertedUser.createdAt
      },
      _meta: {
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({ 
        status: 0,
        message: error.message,
        field: error.field
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({ 
        status: 0,
        message: 'User already exists',
        code: 'DUPLICATE_KEY'
      });
    }

    return res.status(500).json({ 
      status: 0,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
}