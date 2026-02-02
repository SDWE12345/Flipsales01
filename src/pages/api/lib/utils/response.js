// lib/utils/response.js - Standardized API Response Formatter

/**
 * Success response formatter
 */
export function successResponse(data = null, message = 'Success', meta = {}) {
  const response = {
    status: 1,
    message,
    ...(data && { data }),
    ...(Object.keys(meta).length > 0 && { _meta: meta })
  };
  
  return response;
}

/**
 * Error response formatter
 */
export function errorResponse(message = 'Error occurred', code = 'ERROR', details = null) {
  const response = {
    status: 0,
    message,
    code
  };
  
  if (details) {
    response.details = details;
  }
  
  return response;
}

/**
 * Pagination response formatter
 */
export function paginatedResponse(data, page, limit, total, additionalData = {}) {
  return {
    status: 1,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    },
    ...additionalData
  };
}

/**
 * Send JSON response with proper headers
 */
export function sendResponse(res, statusCode, data) {
  res.status(statusCode).json(data);
}

/**
 * Handle API errors uniformly
 */
export function handleApiError(error, res) {
  console.error('API Error:', error);

  if (error.name === 'ValidationError') {
    return sendResponse(res, 400, errorResponse(
      error.message,
      'VALIDATION_ERROR',
      error.errors
    ));
  }

  if (error.code === 11000) {
    return sendResponse(res, 409, errorResponse(
      'Duplicate entry found',
      'DUPLICATE_ERROR'
    ));
  }

  if (error.name === 'JsonWebTokenError') {
    return sendResponse(res, 403, errorResponse(
      'Invalid token',
      'INVALID_TOKEN'
    ));
  }

  if (error.name === 'TokenExpiredError') {
    return sendResponse(res, 401, errorResponse(
      'Token expired',
      'TOKEN_EXPIRED'
    ));
  }

  return sendResponse(res, 500, errorResponse(
    'Internal server error',
    'SERVER_ERROR'
  ));
}

/**
 * Performance timing wrapper
 */
export function withTiming(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    
    // Wrap the response.json to add timing
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      if (data && typeof data === 'object') {
        data._meta = {
          ...(data._meta || {}),
          duration: `${duration}ms`
        };
      }
      
      return originalJson(data);
    };
    
    return handler(req, res);
  };
}

/**
 * Method guard wrapper
 */
export function methodGuard(allowedMethods) {
  return (handler) => {
    return async (req, res) => {
      if (!allowedMethods.includes(req.method)) {
        return sendResponse(res, 405, errorResponse(
          `Method ${req.method} not allowed`,
          'METHOD_NOT_ALLOWED'
        ));
      }
      
      return handler(req, res);
    };
  };
}