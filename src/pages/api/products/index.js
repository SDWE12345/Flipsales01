// pages/api/products/index.js - Optimized Products API with Pagination & Search
import clientPromise from '../../../lib/mongodb';

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
    const [products, totalCount] = await Promise.all([
      productsCollection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .project({
          title: 1,
          description: 1,
          features: 1,
          mrp: 1,
          price: 1,
          selling_price: 1,
          color: 1,
          size: 1,
          storage: 1,
          image: 1,
          images: 1,
          extraImages: 1,
          slNumber: 1,
          disp_order: 1,
          createdAt: 1,
          updatedAt: 1
        })
        .toArray(),
      productsCollection.countDocuments(query),
    ]);

    const duration = Date.now() - startTime;
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      status: 1,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      _meta: {
        duration: `${duration}ms`,
        count: products.length
      }
    });

  } catch (error) {
    console.error('Get Products Error:', error);
    throw error;
  }
}

async function handlePost(req, res, productsCollection, startTime) {
  try {
    const { 
      title,
      description,
      features,
      mrp,
      price,
      selling_price,
      color,
      size,
      storage,
      image,
      images,
      extraImages,
      slNumber,
      disp_order
    } = req.body;

    // Validation
    if (!title || !price || !mrp) {
      return res.status(400).json({ 
        status: 0, 
        message: 'Title, price, and MRP are required' 
      });
    }

    // Get next slNumber
    const lastProduct = await productsCollection
      .find({})
      .sort({ slNumber: -1 })
      .limit(1)
      .toArray();
    
    const newSlNumber = lastProduct.length > 0 ? (lastProduct[0].slNumber || 0) + 1 : 1;

    const newProduct = {
      title: title || '',
      description: description || '',
      features: features || '',
      mrp: parseFloat(mrp) || 0,
      price: parseFloat(price) || 0,
      selling_price: parseFloat(selling_price) || parseFloat(price) || 0,
      color: color || '',
      size: size || '',
      storage: storage || '',
      image: image || '',
      images: images || [],
      extraImages: extraImages || [],
      slNumber: parseInt(slNumber) || newSlNumber,
      disp_order: parseInt(disp_order) || newSlNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await productsCollection.insertOne(newProduct);

    const duration = Date.now() - startTime;

    return res.status(201).json({ 
      status: 1,
      message: 'Product created successfully',
      product: { ...newProduct, _id: result.insertedId },
      _meta: {
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    console.error('Create Product Error:', error);
    throw error;
  }
}