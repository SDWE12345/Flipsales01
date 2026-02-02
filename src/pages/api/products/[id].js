// pages/api/products/[id].js - Optimized Product Detail API
import { ObjectId } from 'mongodb';
import { 
  findOne, 
  updateOne, 
  deleteOne 
} from '../lib/db/helpers';
import { validateProduct, validateObjectId, ValidationError } from '../lib/utils/validation';
import { authenticateToken } from '../lib/middleware/auth';

export default async function handler(req, res) {
  const startTime = Date.now();
  const { id } = req.query;

  try {
    // Validate ID format
    if (!id) {
      return res.status(400).json({ 
        status: 0, 
        message: 'Product ID is required' 
      });
    }

    // Determine query based on ID format
    let query;
    try {
      query = { _id: validateObjectId(id) };
    } catch {
      query = { _id: id }; // Fallback for string IDs
    }

    if (req.method === 'GET') {
      return await handleGet(query, res, startTime);
    }

    // Authentication required for PUT and DELETE
    if (req.method === 'PUT' || req.method === 'DELETE') {
      return authenticateToken(req, res, async () => {
        if (req.method === 'PUT') {
          return await handlePut(query, req, res, startTime);
        }
        if (req.method === 'DELETE') {
          return await handleDelete(query, res, startTime);
        }
      });
    }

    return res.status(405).json({ 
      status: 0,
      message: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Product Detail API Error:', error);

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
      error: error.message 
    });
  }
}

async function handleGet(query, res, startTime) {
  const product = await findOne('products', query);

  if (!product) {
    return res.status(404).json({ 
      status: 0, 
      message: 'Product not found' 
    });
  }

  // Normalize response - ensure consistent field naming
  const normalizedProduct = {
    ...product,
    title: product.title || product.Title || '',
  };
  
  // Remove uppercase Title if exists
  delete normalizedProduct.Title;

  const duration = Date.now() - startTime;

  return res.status(200).json({
    status: 1,
    product: normalizedProduct,
    _meta: {
      duration: `${duration}ms`
    }
  });
}

async function handlePut(query, req, res, startTime) {
  // Validate product data
  const validatedData = validateProduct(req.body);

  // Build update document
  const updateDoc = {
    $set: validatedData,
    $unset: {
      Title: "" // Remove uppercase Title field
    }
  };

  const result = await updateOne('products', query, updateDoc);

  if (!result) {
    return res.status(404).json({ 
      status: 0, 
      message: 'Product not found' 
    });
  }

  const duration = Date.now() - startTime;

  return res.status(200).json({ 
    status: 1,
    message: 'Product updated successfully',
    product: result,
    _meta: {
      duration: `${duration}ms`
    }
  });
}

async function handleDelete(query, res, startTime) {
  const result = await deleteOne('products', query);

  if (result.deletedCount === 0) {
    return res.status(404).json({ 
      status: 0, 
      message: 'Product not found' 
    });
  }

  const duration = Date.now() - startTime;

  return res.status(200).json({ 
    status: 1,
    message: 'Product deleted successfully',
    _meta: {
      duration: `${duration}ms`,
      deletedCount: result.deletedCount
    }
  });
}