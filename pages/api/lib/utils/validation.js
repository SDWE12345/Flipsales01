// lib/utils/validation.js - Input Validation & Sanitization
import { ObjectId } from 'mongodb';

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Email validation
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
  return email.toLowerCase().trim();
}

// Password validation
export function validatePassword(password, minLength = 6) {
  if (!password || password.length < minLength) {
    throw new ValidationError(`Password must be at least ${minLength} characters`, 'password');
  }
  return password;
}

// Phone validation (basic)
export function validatePhone(phone) {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  if (phone && !phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number format', 'phone');
  }
  return phone?.trim();
}

// ObjectId validation
export function validateObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new ValidationError('Invalid ID format', 'id');
  }
  return new ObjectId(id);
}

// Required fields validation
export function validateRequired(data, requiredFields) {
  const missing = [];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
}

// Sanitize string (remove XSS)
export function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Sanitize number
export function sanitizeNumber(value, defaultValue = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

// Sanitize integer
export function sanitizeInt(value, defaultValue = 0) {
  const num = parseInt(value);
  return isNaN(num) ? defaultValue : num;
}

// Sanitize array
export function sanitizeArray(arr, maxLength = 100) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, maxLength).filter(item => item !== null && item !== undefined);
}

// Product validation
export function validateProduct(data) {
  const errors = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  }

  if (!data.price || data.price <= 0) {
    errors.price = 'Valid price is required';
  }

  if (!data.mrp || data.mrp <= 0) {
    errors.mrp = 'Valid MRP is required';
  }

  if (data.mrp && data.price && data.price > data.mrp) {
    errors.price = 'Price cannot be greater than MRP';
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error('Validation failed');
    error.errors = errors;
    throw error;
  }

  return {
    title: sanitizeString(data.title, 200),
    description: sanitizeString(data.description, 5000),
    features: sanitizeString(data.features, 5000),
    mrp: sanitizeNumber(data.mrp),
    price: sanitizeNumber(data.price),
    selling_price: sanitizeNumber(data.selling_price || data.price),
    color: sanitizeString(data.color, 50),
    size: sanitizeString(data.size, 50),
    storage: sanitizeString(data.storage, 50),
    image: sanitizeString(data.image, 500),
    images: sanitizeArray(data.images, 20),
    extraImages: sanitizeArray(data.extraImages, 20),
    slNumber: sanitizeInt(data.slNumber),
    disp_order: sanitizeInt(data.disp_order)
  };
}

// UPI validation
export function validateUPI(upiId) {
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  if (!upiId || !upiRegex.test(upiId)) {
    throw new ValidationError('Invalid UPI ID format', 'upiId');
  }
  return upiId.toLowerCase().trim();
}

// Facebook Pixel validation
export function validatePixelId(pixelId) {
  if (!pixelId || !/^\d+$/.test(pixelId)) {
    throw new ValidationError('Invalid Pixel ID format', 'pixelId');
  }
  return pixelId.trim();
}