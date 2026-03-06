// pages/api/facebookPixel.js
import clientPromise from '../../lib/mongodb';
import authenticateToken from './middleware/auth';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('yourDbName');
    const pixelCollection = db.collection('facebookpixels');

    // GET requests don't need authentication (public)
    if (req.method === 'GET') {
      const pixelData = await pixelCollection.findOne(
        {},
        { sort: { _id: -1 } }
      );

      return res.status(200).json(pixelData || { FacebookPixel: null });
    }

    // POST, PUT, DELETE require authentication
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      return authenticateToken(req, res, async () => {
        await handleAuthenticatedRequest(req, res, pixelCollection);
      });
    }

    return res.status(405).json({ 
      status: 0, 
      message: 'Method Not Allowed' 
    });

  } catch (error) {
    console.error('Facebook Pixel API Error:', error);
    res.status(500).json({ 
      status: 0, 
      message: 'Internal Server Error',
      error: error.message 
    });
  }
}

async function handleAuthenticatedRequest(req, res, collection) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
      case 'PUT':
        const { pixelId } = req.body;

        if (!pixelId) {
          return res.status(400).json({ 
            status: 0, 
            message: 'Pixel ID is required' 
          });
        }

        const existingPixelData = await collection.findOne({});

        if (existingPixelData) {
          // Update existing record
          const result = await collection.findOneAndUpdate(
            { _id: existingPixelData._id },
            { 
              $set: { 
                FacebookPixel: pixelId,
                updatedAt: new Date()
              } 
            },
            { returnDocument: 'after' }
          );

          return res.status(200).json({ 
            status: 1, 
            message: 'Pixel updated successfully',
            updatedPixelData: result
          });
        } else {
          // Create new record
          const newPixelData = {
            FacebookPixel: pixelId,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const result = await collection.insertOne(newPixelData);

          return res.status(201).json({ 
            status: 1, 
            message: 'Pixel created successfully',
            savedPixelData: { _id: result.insertedId, ...newPixelData }
          });
        }

      case 'DELETE':
        const deleteResult = await collection.deleteMany({});

        return res.status(200).json({ 
          status: 1, 
          message: 'Pixel deleted successfully',
          deletedCount: deleteResult.deletedCount
        });

      default:
        return res.status(405).json({ 
          status: 0, 
          message: 'Method Not Allowed' 
        });
    }
  } catch (error) {
    console.error('Handle Request Error:', error);
    return res.status(500).json({ 
      status: 0, 
      message: 'Failed to process request',
      error: error.message 
    });
  }
}