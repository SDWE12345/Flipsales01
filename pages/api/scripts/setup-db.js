// scripts/setup-db.js - Database Setup Script
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'yourDbName';

export default async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(dbName);

    // Create indexes for products collection
    console.log('📊 Creating indexes for products collection...');
    await db.collection('products').createIndexes([
      { key: { slNumber: 1 }, unique: true },
      { key: { title: 'text', description: 'text', features: 'text' } },
      { key: { price: 1 } },
      { key: { createdAt: -1 } },
      { key: { disp_order: 1 } }
    ]);
    console.log('✅ Products indexes created\n');

    // Create indexes for users collection
    console.log('📊 Creating indexes for users collection...');
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { createdAt: -1 } }
    ]);
    console.log('✅ Users indexes created\n');

    // Create indexes for counters collection
    console.log('📊 Creating counters collection...');
    await db.collection('counters').createIndex({ _id: 1 }, { unique: true });
    
    // Initialize counter for products if doesn't exist
    const existingCounter = await db.collection('counters').findOne({ _id: 'product_slNumber' });
    if (!existingCounter) {
      await db.collection('counters').insertOne({
        _id: 'product_slNumber',
        sequence: 0
      });
      console.log('✅ Product counter initialized\n');
    } else {
      console.log('✅ Product counter already exists\n');
    }

    // Create indexes for settings collections
    console.log('📊 Creating indexes for settings collections...');
    await db.collection('facebookpixels').createIndex({ createdAt: -1 });
    await db.collection('upichanges').createIndex({ createdAt: -1 });
    console.log('✅ Settings indexes created\n');

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}
