// pages/api/csvupload.js
import clientPromise from '../../lib/mongodb';
import formidable from 'formidable';
import fs from 'fs';
import Papa from 'papaparse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    
    const [fields, files] = await form.parse(req);
    const csvFile = files.csvFile?.[0];

    if (!csvFile) {
      return res.status(400).json({ 
        status: 0, 
        message: 'No CSV file uploaded' 
      });
    }

    // Read CSV file
    const csvData = fs.readFileSync(csvFile.filepath, 'utf8');

    // Parse CSV
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim()
    });

    if (parsedData.errors.length > 0) {
      return res.status(400).json({ 
        status: 0, 
        message: 'Error parsing CSV',
        errors: parsedData.errors 
      });
    }

    const client = await clientPromise;
    const db = client.db('yourDbName'); // Change to your DB name
    const collection = db.collection('products');

    // Get the highest slNumber
    const lastProduct = await collection
      .find({})
      .sort({ slNumber: -1 })
      .limit(1)
      .toArray();

    let currentSlNumber = lastProduct.length > 0 ? (lastProduct[0].slNumber || 0) : 0;

    // Transform CSV data to product format
    const products = parsedData.data.map((row, index) => {
      currentSlNumber++;

      // Handle images - can be comma-separated or individual columns
      let imagesArray = [];
      if (row.images) {
        if (typeof row.images === 'string' && row.images.includes(',')) {
          imagesArray = row.images.split(',').map(img => img.trim());
        } else {
          imagesArray = [row.images];
        }
      }

      // Add additional image columns if they exist
      ['images1', 'images2', 'images3', 'images4'].forEach(imgField => {
        if (row[imgField]) {
          imagesArray.push(row[imgField]);
        }
      });

      return {
        title: row.title || row.Title || '',
        Title: row.title || row.Title || '',
        mrp: parseFloat(row.mrp) || 0,
        price: parseFloat(row.price || row.selling_price) || 0,
        selling_price: parseFloat(row.price || row.selling_price) || 0,
        color: row.color || '',
        size: row.size || '',
        storage: row.storage || '',
        image: row.image || imagesArray[0] || '',
        images: imagesArray,
        description: row.description || row.features || '',
        features: row.description || row.features || '',
        disp_order: row.disp_order || currentSlNumber,
        slNumber: currentSlNumber,
        id: Date.now() + index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extraImages: row.extraImages ? row.extraImages.split(',').map(img => img.trim()) : []
      };
    });

    // Bulk insert
    if (products.length > 0) {
      const result = await collection.insertMany(products, { ordered: false });
      
      return res.status(200).json({ 
        status: 1, 
        message: `Successfully uploaded ${result.insertedCount} products`,
        insertedCount: result.insertedCount
      });
    } else {
      return res.status(400).json({ 
        status: 0, 
        message: 'No valid products found in CSV' 
      });
    }

  } catch (error) {
    console.error('CSV Upload Error:', error);
    return res.status(500).json({ 
      status: 0, 
      message: 'Error uploading CSV',
      error: error.message 
    });
  }
}