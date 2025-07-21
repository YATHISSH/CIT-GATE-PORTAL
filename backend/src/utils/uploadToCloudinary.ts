import cloudinary from '../config/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

// Simplified function for base64 uploads
export const uploadBase64ToCloudinary = async (
  base64Data: string,
  folder: string = 'test-questions'
): Promise<CloudinaryUploadResult> => {
  try {
    // BARE MINIMUM UPLOAD: No transformations, no extra parameters.
    // This is the most reliable way to avoid signature errors.
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: folder,
      resource_type: 'image',
    });
    
    console.log('✅ Base64 image uploaded successfully:', result.secure_url);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error('❌ Cloudinary base64 upload error:', {
        message: error.message,
        http_code: error.http_code,
    });
    return {
      success: false,
      error: error.message || 'Base64 upload failed.',
    };
  }
};

// Simplified function for buffer uploads
export const uploadImageToCloudinary = async (
  imageBuffer: Buffer,
  folder: string = 'test-questions'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error('❌ Cloudinary buffer upload error:', error);
          resolve({ success: false, error: error.message });
        } else if (result) {
          console.log('✅ Buffer image uploaded successfully:', result.secure_url);
          resolve({ success: true, url: result.secure_url, publicId: result.public_id });
        } else {
          resolve({ success: false, error: 'Upload failed without an error message.' });
        }
      }
    );
    uploadStream.end(imageBuffer);
  });
};
