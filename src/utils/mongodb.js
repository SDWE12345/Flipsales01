// utils/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://v4x123:v4x123@cluster0.i3hnzcs.mongodb.net/demobhai';

const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the client across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the connectToDatabase function that your API routes are importing
export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db('yourDbName'); // specify your database name
  return { client, db };
}

// Also export the default clientPromise for backward compatibility
export default clientPromise;