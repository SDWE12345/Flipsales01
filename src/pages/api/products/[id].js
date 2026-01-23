import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const client = await clientPromise;
    const db = client.db('yourDbName');
    const collection = db.collection('products');

    let query;
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { _id: id };
    }

    if (req.method === 'GET') {
      const product = await collection.findOne(query);

      if (!product) {
        return res.status(404).json({ 
          status: 0, 
          message: 'Product not found' 
        });
      }

      // Normalize the response - ensure only lowercase 'title' exists
      const normalizedProduct = {
        ...product,
        title: product.title || product.Title || '',
      };
      
      // Remove uppercase Title if it exists
      delete normalizedProduct.Title;

      return res.status(200).json(normalizedProduct);
    }

    if (req.method === 'PUT') {
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

      const updateData = {
        $set: {
          title: title || '',
          description: description || '',
          features: features || '',
          mrp: mrp ? parseFloat(mrp) : 0,
          price: price ? parseFloat(price) : 0,
          selling_price: selling_price ? parseFloat(selling_price) : price ? parseFloat(price) : 0,
          color: color || '',
          size: size || '',
          storage: storage || '',
          image: image || '',
          images: images || [],
          extraImages: extraImages || [],
          slNumber: slNumber ? parseInt(slNumber) : 0,
          disp_order: disp_order ? parseInt(disp_order) : 0,
          updatedAt: new Date().toISOString()
        },
        $unset: {
          Title: "" // Remove the uppercase Title field
        }
      };

      const result = await collection.updateOne(query, updateData);

      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          status: 0, 
          message: 'Product not found' 
        });
      }

      const updatedProduct = await collection.findOne(query);

      return res.status(200).json({ 
        status: 1, 
        message: 'Product updated successfully',
        product: updatedProduct
      });
    }

    if (req.method === 'DELETE') {
      const result = await collection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          status: 0, 
          message: 'Product not found' 
        });
      }

      return res.status(200).json({ 
        status: 1, 
        message: 'Product deleted successfully' 
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