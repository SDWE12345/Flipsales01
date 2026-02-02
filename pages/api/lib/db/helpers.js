// lib/db/helpers.js - Database Helper Functions with Caching
import clientPromise from '../../mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = process.env.MONGODB_DB || 'yourDbName';

// Simple in-memory cache (use Redis in production)
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

function getCacheKey(collection, query) {
  return `${collection}:${JSON.stringify(query)}`;
}

function getCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(pattern = null) {
  if (pattern) {
    const keys = Array.from(cache.keys()).filter(k => k.startsWith(pattern));
    keys.forEach(k => cache.delete(k));
  } else {
    cache.clear();
  }
}

// Get database connection
export async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// Get collection
export async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

// Find one document with caching
export async function findOne(collectionName, query, options = {}) {
  const cacheKey = getCacheKey(collectionName, { query, options });
  const cached = getCache(cacheKey);
  
  if (cached) return cached;

  const collection = await getCollection(collectionName);
  const result = await collection.findOne(query, options);
  
  if (result) setCache(cacheKey, result);
  
  return result;
}

// Find many documents with caching
export async function findMany(collectionName, query = {}, options = {}) {
  const cacheKey = getCacheKey(collectionName, { query, options });
  const cached = getCache(cacheKey);
  
  if (cached) return cached;

  const collection = await getCollection(collectionName);
  const result = await collection.find(query, options).toArray();
  
  setCache(cacheKey, result);
  
  return result;
}

// Insert one document
export async function insertOne(collectionName, document) {
  clearCache(collectionName);
  
  const collection = await getCollection(collectionName);
  const doc = {
    ...document,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// Insert many documents
export async function insertMany(collectionName, documents) {
  clearCache(collectionName);
  
  const collection = await getCollection(collectionName);
  const docs = documents.map(doc => ({
    ...doc,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  const result = await collection.insertMany(docs, { ordered: false });
  return result;
}

// Update one document
export async function updateOne(collectionName, query, update) {
  clearCache(collectionName);
  
  const collection = await getCollection(collectionName);
  const updateDoc = {
    ...update,
    $set: {
      ...(update.$set || {}),
      updatedAt: new Date()
    }
  };
  
  const result = await collection.findOneAndUpdate(
    query,
    updateDoc,
    { returnDocument: 'after' }
  );
  
  return result;
}

// Update many documents
export async function updateMany(collectionName, query, update) {
  clearCache(collectionName);
  
  const collection = await getCollection(collectionName);
  const result = await collection.updateMany(query, {
    ...update,
    $set: {
      ...(update.$set || {}),
      updatedAt: new Date()
    }
  });
  
  return result;
}

// Delete one document
export async function deleteOne(collectionName, query) {
  clearCache(collectionName);
  
  const collection = await getCollection(collectionName);
  const result = await collection.deleteOne(query);
  
  return result;
}

// Delete many documents
export async function deleteMany(collectionName, query) {
  clearCache(collectionName);
  
  const collection = await getCollection(collectionName);
  const result = await collection.deleteMany(query);
  
  return result;
}

// Aggregate query
export async function aggregate(collectionName, pipeline) {
  const collection = await getCollection(collectionName);
  return await collection.aggregate(pipeline).toArray();
}

// Count documents
export async function countDocuments(collectionName, query = {}) {
  const collection = await getCollection(collectionName);
  return await collection.countDocuments(query);
}

// Get next sequence number
export async function getNextSequence(sequenceName) {
  const collection = await getCollection('counters');
  const result = await collection.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  
  return result.sequence;
}

// Create indexes
export async function createIndexes(collectionName, indexes) {
  const collection = await getCollection(collectionName);
  return await collection.createIndexes(indexes);
}

// Transaction wrapper
export async function withTransaction(callback) {
  const client = await clientPromise;
  const session = client.startSession();
  
  try {
    await session.withTransaction(callback);
  } finally {
    await session.endSession();
  }
}