// pages/api/settings/facebook-pixel.js - Optimized Facebook Pixel API
import { findOne, updateOne, insertOne, deleteMany } from '../lib/db/helpers';
import { authenticateToken } from '../lib/middleware/auth';
import { validatePixelId, ValidationError } from '../lib/utils/validation';

export default async function handler(req, res) {
  const startTime = Date.now();

  try {
    if (req.method === 'GET') {
      return await handleGet(res, startTime);
    }

    // Authentication required for POST, PUT, DELETE
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      return authenticateToken(req, res, async () => {
        if (req.method === 'DELETE') {
          return await handleDelete(res, startTime);
        }
        return await handleUpsert(req, res, startTime);
      });
    }

    return res.status(405).json({ 
      status: 0, 
      message: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Facebook Pixel API Error:', error);

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

async function handleGet(res, startTime) {
  const pixelData = await findOne(
    'facebookpixels',
    {},
    { sort: { _id: -1 } }
  );

  const duration = Date.now() - startTime;

  return res.status(200).json({
    status: 1,
    FacebookPixel: pixelData?.FacebookPixel || null,
    data: pixelData || null,
    _meta: {
      duration: `${duration}ms`
    }
  });
}

async function handleUpsert(req, res, startTime) {
  const { pixelId, accessToken, testEventCode } = req.body;

  if (!pixelId) {
    return res.status(400).json({ 
      status: 0, 
      message: 'Pixel ID is required' 
    });
  }

  // Validate pixel ID format
  const validatedPixelId = validatePixelId(pixelId);

  const pixelData = {
    FacebookPixel: validatedPixelId,
    accessToken: accessToken || null,
    testEventCode: testEventCode || null
  };

  const existingData = await findOne('facebookpixels', {});

  let result;
  let isNew = false;

  if (existingData) {
    // Update existing
    result = await updateOne(
      'facebookpixels',
      { _id: existingData._id },
      { $set: pixelData }
    );
  } else {
    // Create new
    result = await insertOne('facebookpixels', pixelData);
    isNew = true;
  }

  const duration = Date.now() - startTime;

  return res.status(isNew ? 201 : 200).json({ 
    status: 1, 
    message: isNew ? 'Pixel created successfully' : 'Pixel updated successfully',
    data: result,
    _meta: {
      duration: `${duration}ms`
    }
  });
}

async function handleDelete(res, startTime) {
  const result = await deleteMany('facebookpixels', {});

  const duration = Date.now() - startTime;

  return res.status(200).json({ 
    status: 1, 
    message: 'Pixel deleted successfully',
    deletedCount: result.deletedCount,
    _meta: {
      duration: `${duration}ms`
    }
  });
}