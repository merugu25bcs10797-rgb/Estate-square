import { Router } from 'express';
import {
  getMyEnquiries,
  getReceivedEnquiries,
  updateEnquiryStatus
} from '../controllers/enquiryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validate, validateObjectId } from '../middleware/validateMiddleware.js';
import { enquiryStatusSchema } from '../utils/zodSchemas.js';

const router = Router();

router.use(protect);

// Buyer gets their sent enquiries
router.get('/my', restrictTo('buyer'), getMyEnquiries);

// Seller gets received enquiries
router.get('/received', restrictTo('seller'), getReceivedEnquiries);

// Update status
router.patch(
  '/:id/status',
  validateObjectId('id'),
  validate(enquiryStatusSchema),
  updateEnquiryStatus
);

export default router;
