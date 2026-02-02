// // import mongoose from 'mongoose';

// // const uri = 'mongodb+srv://v4x123:v4x123@cluster0.i3hnzcs.mongodb.net/demobhai';
// // // lib/mongodb.js
// // import { MongoClient } from 'mongodb';

// // const options = {
// //   maxPoolSize: 10,
// //   minPoolSize: 5,
// //   serverSelectionTimeoutMS: 5000,
// //   socketTimeoutMS: 45000,
// // };

// // let client;
// // let clientPromise;

// // if (!process.env.MONGODB_URI) {
// //   throw new Error('Add MONGODB_URI to .env.local');
// // }

// // if (process.env.NODE_ENV === 'development') {
// //   if (!global._mongoClientPromise) {
// //     client = new MongoClient(uri, options);
// //     global._mongoClientPromise = client.connect();
// //   }
// //   clientPromise = global._mongoClientPromise;
// // } else {
// //   client = new MongoClient(uri, options);
// //   clientPromise = client.connect();
// // }

// // export default clientPromise;

// // lib/mongodb.js
// import { MongoClient } from 'mongodb';

// const uri = 'mongodb+srv://v4x123:v4x123@cluster0.i3hnzcs.mongodb.net/demobhai';
// const options = {
//   maxPoolSize: 10,
//   minPoolSize: 5,
//   serverSelectionTimeoutMS: 5000,
//   socketTimeoutMS: 45000,
// };

// let client;
// let clientPromise;


// if (process.env.NODE_ENV === 'development') {
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// export default clientPromise;

// lib/mongodb.js - Optimized MongoDB Connection with Pooling
import { MongoClient } from 'mongodb';
import setupDatabase from './scripts/setup-db';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}
const uri = 'mongodb+srv://v4x123:v4x123@cluster0.i3hnzcs.mongodb.net';
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve connection across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

setupDatabase();
export default clientPromise;