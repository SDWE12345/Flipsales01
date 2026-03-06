// pages/api/register.js
import clientPromise from '../../lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        status: 0,
        message: 'Email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        status: 0,
        message: 'Password must be at least 6 characters' 
      });
    }

    const client = await clientPromise;
    const db = client.db('yourDbName');
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ 
        status: 0,
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email },
      process.env.JWT_SECRET || 'xxxxz',
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      status: 1,
      message: 'User registered successfully', 
      token,
      user: {
        id: result.insertedId,
        email,
        name: newUser.name
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      status: 0,
      message: 'Internal Server Error',
      error: error.message 
    });
  }
}