import multer from 'multer';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { AppError } from './errorMiddleware.js';

// Memory storage for stream uploads to Cloudinary
const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid image format. Only JPEG, PNG, and WebP images are allowed.', 400), false);
  }
};

export const uploadImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 5 // max 5 files
  },
  fileFilter
}).array('images', 5);

// Helper to upload a buffer stream to Cloudinary
export const uploadBufferToCloudinary = (buffer, folder = 'propertyhub/listings') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      return reject(
        new AppError(
          'Cloudinary is not configured on the server. Real image uploads cannot proceed without CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET set in the environment.',
          500
        )
      );
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 900, crop: 'limit' }, { quality: 'auto' }]
      },
      (error, result) => {
        if (error) {
          return reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    stream.end(buffer);
  });
};

// Helper to safely delete an asset from Cloudinary
export const deleteFromCloudinary = async (public_id) => {
  if (!public_id || !isCloudinaryConfigured) return;
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error(`[Cloudinary Warning] Failed to delete asset ${public_id}:`, error.message);
  }
};
