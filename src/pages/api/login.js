// pages/api/login.js
import clientPromise from '../../lib/mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const client = await clientPromise;
    const db = client.db('yourDbName');
    const usersCollection = db.collection('users');

    // Find user by email only (indexed query)
    const user = await usersCollection.findOne(
      { email },
      { projection: { _id: 1, email: 1, password: 1, name: 1 } }
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password is hashed or plain text (for backward compatibility)
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Hashed password - use bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password (legacy)
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with proper secret from env
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || 'xxxxz',
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(200).json({ 
      message: 'done', 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}