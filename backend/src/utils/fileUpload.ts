import multer from 'multer';
import path from 'path';

// Configure multer for handling file uploads
const storage = multer.memoryStorage(); // Store in memory for Cloudinary upload

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware for handling multiple question images
export const uploadQuestionImages = upload.array('questionImages', 50); // Allow up to 50 images

// Middleware for handling single question image
export const uploadSingleImage = upload.single('questionImage');


// Error handling middleware
export const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 50 images.' });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
};
