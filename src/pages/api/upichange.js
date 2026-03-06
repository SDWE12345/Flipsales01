// pages/api/Upichange.js
import clientPromise from '../../lib/mongodb';
import authenticateToken from './middleware/auth';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('yourDbName');
    const upiCollection = db.collection('upichanges');
    const pixelCollection = db.collection('facebookpixels');

    if (req.method === 'GET') {
      // Public endpoint - no authentication needed
      // Use Promise.all for parallel queries (faster)
      const [upiData, pixelData] = await Promise.all([
        upiCollection.findOne({}, { sort: { _id: -1 } }),
        pixelCollection.findOne({}, { sort: { _id: -1 } })
      ]);

      return res.status(200).json({ 
        upi: upiData || null, 
        pixelId: pixelData || null 
      });
    }

    // For POST and PUT, require authentication
    if (req.method === 'POST' || req.method === 'PUT') {
      // Use middleware with promise
      return authenticateToken(req, res, async () => {
        await handleAuthenticatedRequest(req, res, upiCollection);
      });
    }

    return res.status(405).json({ 
      status: 0, 
      message: 'Method Not Allowed' 
    });

  } catch (error) {
    console.error('UPI API Error:', error);
    res.status(500).json({ 
      status: 0, 
      message: 'Internal Server Error',
      error: error.message 
    });
  }
}

async function handleAuthenticatedRequest(req, res, collection) {
  try {
    const existingData = await collection.findOne({});

    if (existingData) {
      // Update existing record
      const result = await collection.findOneAndUpdate(
        { _id: existingData._id },
        { $set: { ...req.body, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );

      return res.status(200).json({ 
        status: 1, 
        message: 'Updated successfully',
        data: result 
      });
    } else {
      // Create new record
      const newData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newData);

      return res.status(201).json({ 
        status: 1, 
        message: 'Created successfully',
        data: { _id: result.insertedId, ...newData }
      });
    }
  } catch (error) {
    console.error('Update Error:', error);
    return res.status(500).json({ 
      status: 0, 
      message: 'Failed to save data',
      error: error.message 
    });
  }
}