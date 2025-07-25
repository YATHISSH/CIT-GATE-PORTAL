import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables directly within this file.
// This is the key fix to ensure credentials are always available.
dotenv.config();

// Configure Cloudinary using individual, easier-to-debug keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// A simple utility to verify the connection on server startup
export const testCloudinaryConnection = async () => {
  try {
    // Add a check to provide a clear error if variables are missing
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('One or more Cloudinary environment variables are not set.');
    }
    await cloudinary.api.ping();
    console.log('Cloudinary connection verified successfully.');
  } catch (error) {
    console.error('Cloudinary connection failed. Please check your API credentials in the .env file.');
    throw error; // Stop the server startup if the connection fails
  }
};

export default cloudinary;
