// pages/api/products/index.js - Optimized Products API with Pagination & Search
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const startTime = Date.now();

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'yourDbName');
    const productsCollection = db.collection('products');
    const pixelCollection = db.collection('facebookpixels');

    if (req.method === 'GET') {
      return await handleGet(req, res, productsCollection, pixelCollection, startTime);
    }

    if (req.method === 'POST') {
      // Authentication would go here
      return await handlePost(req, res, productsCollection, startTime);
    }

    return res.status(405).json({ 
      status: 0,
      message: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ 
      status: 0,
      message: 'Internal server error',
      error: error.message 
    });
  }
}

async function handleGet(req, res, productsCollection, pixelCollection, startTime) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'slNumber',
      sortOrder = 'asc',
      minPrice,
      maxPrice,
      color,
      size,
      storage
    } = req.query;

    // Build query
    const query = {};

    // Search in title, description, features
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { features: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by attributes
    if (color) query.color = { $regex: color, $options: 'i' };
    if (size) query.size = { $regex: size, $options: 'i' };
    if (storage) query.storage = { $regex: storage, $options: 'i' };

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute queries in parallel for better performance
    const [pixelData] = await Promise.all([
    
      pixelCollection.findOne({}, { sort: { _id: -1 } })
    ]);

    const duration = Date.now() - startTime;

    return res.status(200).json({
      status: 1,
      pixelId: pixelData || null,
      _meta: {
        duration: `${duration}ms`,
      }
    });

  } catch (error) {
    console.error('Get Products Error:', error);
    throw error;
  }
}