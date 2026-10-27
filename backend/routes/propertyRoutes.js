import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController.js';
import { toggleFavorite } from '../controllers/favoriteController.js';
import { createEnquiry } from '../controllers/enquiryController.js';
import { createVisit } from '../controllers/visitController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validate, validateObjectId } from '../middleware/validateMiddleware.js';
import { uploadImages } from '../middleware/uploadMiddleware.js';
import {
  propertyCreateSchema,
  propertyUpdateSchema,
  propertySearchSchema,
  enquiryCreateSchema,
  visitCreateSchema
} from '../utils/zodSchemas.js';

const router = Router();

// Public search with query validation
router.get('/', validate(propertySearchSchema, 'query'), getProperties);

// Seller's own properties
router.get('/my', protect, restrictTo('seller'), getMyProperties);

// Single property details
router.get('/:id', validateObjectId('id'), optionalProtect, getPropertyById);

// Create property (Seller only)
router.post(
  '/',
  protect,
  restrictTo('seller'),
  uploadImages,
  validate(propertyCreateSchema),
  createProperty
);

// Update property (Seller only)
router.put(
  '/:id',
  protect,
  restrictTo('seller'),
  validateObjectId('id'),
  uploadImages,
  validate(propertyUpdateSchema),
  updateProperty
);

// Delete property (Seller or Admin)
router.delete(
  '/:id',
  protect,
  restrictTo('seller', 'admin'),
  validateObjectId('id'),
  deleteProperty
);

// Favorite toggle on property (Buyer only)
router.post(
  '/:id/favorite',
  protect,
  restrictTo('buyer'),
  validateObjectId('id'),
  toggleFavorite
);

// Submit enquiry on property (Buyer only)
router.post(
  '/:id/enquiries',
  protect,
  restrictTo('buyer'),
  validateObjectId('id'),
  validate(enquiryCreateSchema),
  createEnquiry
);

// Submit visit request on property (Buyer only)
router.post(
  '/:id/visits',
  protect,
  restrictTo('buyer'),
  validateObjectId('id'),
  validate(visitCreateSchema),
  createVisit
);

export default router;
