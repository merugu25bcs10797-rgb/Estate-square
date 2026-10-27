import { Router } from 'express';
import {
  getPendingProperties,
  approveProperty,
  rejectProperty
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validate, validateObjectId } from '../middleware/validateMiddleware.js';
import { rejectListingSchema } from '../utils/zodSchemas.js';

const router = Router();

// All admin routes require admin role
router.use(protect, restrictTo('admin'));

router.get('/properties/pending', getPendingProperties);
router.patch('/properties/:id/approve', validateObjectId('id'), approveProperty);
router.patch('/properties/:id/reject', validateObjectId('id'), validate(rejectListingSchema), rejectProperty);

export default router;
