// pages/api/products/index.js - Optimized Products API with Pagination & Search
import { 
  findMany, 
  insertOne, 
  countDocuments,
  findOne,
  getNextSequence 
} from '../lib/db/helpers';
import { validateProduct, ValidationError } from '../lib/utils/validation';
import { authenticateToken } from '../lib/middleware/auth';

export default async function handler(req, res) {
  const startTime = Date.now();

  try {
    if (req.method === 'GET') {
      return await handleGet(req, res, startTime);
    }

    if (req.method === 'POST') {
      return authenticateToken(req, res, async () => {
        return await handlePost(req, res, startTime);
      });
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

async function handleGet(req, res, startTime) {
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

    // Execute queries in parallel
    const [products, totalCount, pixelData] = await Promise.all([
      findMany('products', query, {
        sort,
        skip,
        limit: limitNum,
        projection: { 
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
        }
      }),
      countDocuments('products', query),
      findOne('facebookpixels', {}, { sort: { _id: -1 } })
    ]);

    const duration = Date.now() - startTime;

    return res.status(200).json({
      status: 1,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1
      },
      pixelId: pixelData?.FacebookPixel || null,
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

async function handlePost(req, res, startTime) {
  try {
    // Validate product data
    const validatedData = validateProduct(req.body);

    // Get next slNumber
    const nextSlNumber = validatedData.slNumber || await getNextSequence('product_slNumber');

    const newProduct = {
      ...validatedData,
      slNumber: nextSlNumber,
      disp_order: validatedData.disp_order || nextSlNumber
    };

    const insertedProduct = await insertOne('products', newProduct);

    const duration = Date.now() - startTime;

    return res.status(201).json({ 
      status: 1,
      message: 'Product created successfully',
      product: insertedProduct,
      _meta: {
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ 
        status: 0,
        message: error.message,
        field: error.field
      });
    }

    if (error.errors) {
      return res.status(400).json({ 
        status: 0,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    throw error;
  }
}