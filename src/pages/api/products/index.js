// pages/api/products/index.js
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('yourDbName');
    const collection = db.collection('products');
    const pixelCollection = db.collection('facebookpixels');

      
      if (req.method === 'GET') {
      const [ pixelData] = await Promise.all([
        pixelCollection.findOne({}, { sort: { _id: -1 } })
      ]);
      const products = await collection
        .find({})
        .sort({ slNumber: 1, disp_order: 1, createdAt: -1 })
        .toArray();

      return res.status(200).json({products:products,pixelId: pixelData || null});
    }

    if (req.method === 'POST') {
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
      const lastProduct = await collection
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

      const result = await collection.insertOne(newProduct);

      return res.status(201).json({ 
        status: 1, 
        message: 'Product added successfully',
        productId: result.insertedId,
        product: { ...newProduct, _id: result.insertedId }
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      status: 0, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}