import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Force load env from backend/.env if not already loaded (useful for local dev)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        upload_preset: 'rhaysource_products',
        folder: 'rhaysource/products',
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      signature,
      timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Cloudinary sign error:', error);
    res.status(500).json({ message: 'Error generating signature' });
  }
}
